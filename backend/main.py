from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from config import SITE_NAME, R2_BUCKET_NAME
from storage import upload_file_to_r2

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
async def upload_audio(file: UploadFile = File(...)):
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

    await file.seek(0)

    key = file.filename
    
    if R2_BUCKET_NAME:
        try:
            key = upload_file_to_r2(file.file, file.filename, file.content_type or "audio/mpeg")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"R2 storage error: {str(e)}")

    return {
        "success": True,
        "message": "File uploaded successfully to backend",
        "file": {
            "name": file.filename,
            "size": file_size,
            "type": file.content_type,
            "key": key,
        },
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)