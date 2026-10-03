from io import BytesIO
import uuid
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from config import SITE_NAME, R2_BUCKET_NAME, GNANI_API_KEY
from storage import upload_file_to_r2
from gnani_service import smart_transcribe, get_batch_job_status

ALLOWED_EXTENSIONS = {"mp3", "wav", "ogg", "flac", "aac", "m4a"}

app = FastAPI(title=f"{SITE_NAME} API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "app": SITE_NAME, "message": "Server is running"}


@app.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    language: str = Form("en-IN"),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    extension = file.filename.split(".")[-1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload MP3, WAV, OGG, FLAC, AAC, or M4A.",
        )

    file_content = await file.read()
    file_size = len(file_content)
    key = f"{uuid.uuid4().hex[:10]}_{file.filename}"

    if R2_BUCKET_NAME:
        try:
            upload_file_to_r2(
                BytesIO(file_content),
                key,
                file.content_type or "audio/mpeg",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"R2 storage error: {str(e)}")

    transcription_result = None
    transcription_error = None

    if GNANI_API_KEY:
        try:
            transcription_result = await smart_transcribe(
                audio_bytes=file_content,
                filename=file.filename,
                content_type=file.content_type or "audio/mpeg",
                language_code=language,
                r2_key=key if R2_BUCKET_NAME else None,
            )
        except Exception as e:
            transcription_error = str(e)
    else:
        transcription_error = "GNANI_API_KEY is not configured in backend/.env"

    return {
        "success": True,
        "message": "File uploaded and processed successfully",
        "file": {
            "name": file.filename,
            "size": file_size,
            "type": file.content_type,
            "key": key,
        },
        "transcript": transcription_result.get("transcript") if transcription_result else None,
        "segments": transcription_result.get("segments") if transcription_result else [],
        "language": transcription_result.get("language_code", language) if transcription_result else language,
        "method": transcription_result.get("method") if transcription_result else None,
        "transcription_error": transcription_error,
    }


@app.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form("en-IN"),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    extension = file.filename.split(".")[-1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload MP3, WAV, OGG, FLAC, AAC, or M4A.",
        )

    if not GNANI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GNANI_API_KEY is not configured in backend/.env",
        )

    file_content = await file.read()
    key = f"{uuid.uuid4().hex[:10]}_{file.filename}"

    if R2_BUCKET_NAME:
        upload_file_to_r2(
            BytesIO(file_content),
            key,
            file.content_type or "audio/mpeg",
        )

    try:
        result = await smart_transcribe(
            audio_bytes=file_content,
            filename=file.filename,
            content_type=file.content_type or "audio/mpeg",
            language_code=language,
            r2_key=key if R2_BUCKET_NAME else None,
        )
        return {
            "success": True,
            "transcript": result.get("transcript", ""),
            "segments": result.get("segments", []),
            "language": result.get("language_code", language),
            "method": result.get("method"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/jobs/{job_id}")
async def job_status(job_id: str):
    try:
        return await get_batch_job_status(job_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)