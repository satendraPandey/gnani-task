from io import BytesIO
import uuid
from contextlib import asynccontextmanager
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from config import SITE_NAME, R2_BUCKET_NAME, GNANI_API_KEY
from storage import upload_file_to_r2
from gnani_service import smart_transcribe, get_batch_job_status
from database import init_db, get_db
from models import User, Transcription, Segment
from summarizer import summarize_transcript

ALLOWED_EXTENSIONS = {"mp3", "wav", "ogg", "flac", "aac", "m4a"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title=f"{SITE_NAME} API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserSyncRequest(BaseModel):
    email: str
    name: str | None = None
    image: str | None = None


class SummarizeRequest(BaseModel):
    transcription_id: str | None = None
    transcript: str | None = None
    format_style: str = "detailed"
    language: str = "en"


@app.get("/")
def read_root():
    return {"status": "ok", "app": SITE_NAME, "message": "Server is running"}


@app.post("/auth/sync-user")
def sync_user(payload: UserSyncRequest, db: Session = Depends(get_db)):
    if not db:
        return {"success": False, "message": "Database not configured"}

    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        if payload.name is not None:
            user.name = payload.name
        if payload.image is not None:
            user.image = payload.image
        db.commit()
        db.refresh(user)
    else:
        user = User(
            email=payload.email,
            name=payload.name,
            image=payload.image,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "success": True,
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "image": user.image,
    }


@app.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    language: str = Form("en-IN"),
    user_id: str | None = Form(None),
    summarize: bool = Form(False),
    format_style: str = Form("detailed"),
    db: Session = Depends(get_db),
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

    summary_text = None
    if summarize and transcription_result and transcription_result.get("transcript"):
        try:
            summary_text = await summarize_transcript(
                transcript=transcription_result["transcript"],
                format_style=format_style,
                language=language,
            )
        except Exception:
            pass

    transcription_id = None
    if db:
        try:
            rec_status = "completed" if (transcription_result and transcription_result.get("transcript")) else ("failed" if transcription_error else "pending")
            record = Transcription(
                user_id=user_id,
                filename=file.filename,
                file_key=key,
                file_size=file_size,
                file_type=file.content_type or "audio/mpeg",
                language=language,
                status=rec_status,
                method=transcription_result.get("method") if transcription_result else None,
                job_id=transcription_result.get("job_id") if transcription_result else None,
                full_transcript=transcription_result.get("transcript") if transcription_result else None,
                summary=summary_text,
                duration_seconds=transcription_result.get("duration_seconds") if transcription_result else None,
                error_message=transcription_error,
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            transcription_id = record.id

            if transcription_result and transcription_result.get("segments"):
                for seg in transcription_result["segments"]:
                    seg_record = Segment(
                        transcription_id=record.id,
                        segment_id=seg.get("segment_id"),
                        speaker_id=seg.get("speaker_id"),
                        start_time=seg.get("start_time"),
                        end_time=seg.get("end_time"),
                        text=seg.get("text", ""),
                    )
                    db.add(seg_record)
                db.commit()
        except Exception:
            db.rollback()

    return {
        "success": True,
        "message": "File uploaded and processed successfully",
        "transcription_id": transcription_id,
        "file": {
            "name": file.filename,
            "size": file_size,
            "type": file.content_type,
            "key": key,
        },
        "transcript": transcription_result.get("transcript") if transcription_result else None,
        "summary": summary_text,
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


@app.get("/transcriptions")
def get_user_transcriptions(user_id: str, db: Session = Depends(get_db)):
    if not db:
        return {"success": True, "transcriptions": []}
    records = (
        db.query(Transcription)
        .filter(Transcription.user_id == user_id)
        .order_by(Transcription.created_at.desc())
        .all()
    )
    return {
        "success": True,
        "transcriptions": [
            {
                "id": r.id,
                "filename": r.filename,
                "status": r.status,
                "language": r.language,
                "full_transcript": r.full_transcript,
                "summary": r.summary,
                "duration_seconds": r.duration_seconds,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in records
        ],
    }


@app.get("/transcriptions/{transcription_id}")
def get_transcription_detail(transcription_id: str, db: Session = Depends(get_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    record = (
        db.query(Transcription)
        .filter(Transcription.id == transcription_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Transcription not found")
    return {
        "success": True,
        "id": record.id,
        "filename": record.filename,
        "status": record.status,
        "language": record.language,
        "full_transcript": record.full_transcript,
        "summary": record.summary,
        "duration_seconds": record.duration_seconds,
        "created_at": record.created_at.isoformat() if record.created_at else None,
        "segments": [
            {
                "id": seg.id,
                "segment_id": seg.segment_id,
                "speaker_id": seg.speaker_id,
                "start_time": seg.start_time,
                "end_time": seg.end_time,
                "text": seg.text,
            }
            for seg in record.segments
        ],
    }


@app.post("/summarize")
async def summarize(
    payload: SummarizeRequest,
    db: Session = Depends(get_db),
):
    text_to_summarize = payload.transcript
    record = None

    if payload.transcription_id and db:
        record = (
            db.query(Transcription)
            .filter(Transcription.id == payload.transcription_id)
            .first()
        )
        if not record:
            raise HTTPException(status_code=404, detail="Transcription record not found")
        if not text_to_summarize:
            text_to_summarize = record.full_transcript

    if not text_to_summarize or not text_to_summarize.strip():
        raise HTTPException(
            status_code=400,
            detail="No transcript text provided or found for summarization",
        )

    try:
        summary_result = await summarize_transcript(
            transcript=text_to_summarize,
            format_style=payload.format_style,
            language=payload.language,
        )

        if record and db:
            record.summary = summary_result
            db.commit()
            db.refresh(record)

        return {
            "success": True,
            "summary": summary_result,
            "transcription_id": payload.transcription_id,
            "format_style": payload.format_style,
        }
    except Exception as e:
        if db and record:
            db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/jobs/{job_id}")
async def job_status(job_id: str):
    try:
        return await get_batch_job_status(job_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)