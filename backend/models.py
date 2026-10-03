import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    image = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    transcriptions = relationship(
        "Transcription", back_populates="user", cascade="all, delete-orphan"
    )


class Transcription(Base):
    __tablename__ = "transcriptions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(
        String,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    filename = Column(String, nullable=False)
    file_key = Column(String, nullable=False, index=True)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String, nullable=False)
    language = Column(String, default="en-IN", nullable=False)
    status = Column(String, default="pending", nullable=False, index=True)
    method = Column(String, nullable=True)
    job_id = Column(String, nullable=True, index=True)
    full_transcript = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    summary_detailed = Column(Text, nullable=True)
    summary_brief = Column(Text, nullable=True)
    summary_bullets = Column(Text, nullable=True)
    summary_action_items = Column(Text, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="transcriptions")
    segments = relationship(
        "Segment",
        back_populates="transcription",
        cascade="all, delete-orphan",
        order_by="Segment.start_time",
    )
    summaries = relationship(
        "Summary",
        back_populates="transcription",
        cascade="all, delete-orphan",
    )


class Segment(Base):
    __tablename__ = "segments"

    id = Column(String, primary_key=True, default=generate_uuid)
    transcription_id = Column(
        String,
        ForeignKey("transcriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    segment_id = Column(Integer, nullable=True)
    speaker_id = Column(Integer, nullable=True)
    start_time = Column(Float, nullable=True)
    end_time = Column(Float, nullable=True)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    transcription = relationship("Transcription", back_populates="segments")


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(String, primary_key=True, default=generate_uuid)
    transcription_id = Column(
        String,
        ForeignKey("transcriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    format_style = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    language = Column(String, default="en", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    transcription = relationship("Transcription", back_populates="summaries")
