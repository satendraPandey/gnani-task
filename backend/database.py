from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from config import DATABASE_URL

Base = declarative_base()


def get_engine():
    if not DATABASE_URL:
        return None
    url = DATABASE_URL
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    return create_engine(url, pool_pre_ping=True)


engine = get_engine()

SessionLocal = (
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
    if engine
    else None
)


def get_db():
    if not SessionLocal:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    if engine:
        import models
        Base.metadata.create_all(bind=engine)
        try:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE transcriptions ADD COLUMN IF NOT EXISTS summary TEXT;"))
                conn.execute(text("ALTER TABLE transcriptions ADD COLUMN IF NOT EXISTS summary_detailed TEXT;"))
                conn.execute(text("ALTER TABLE transcriptions ADD COLUMN IF NOT EXISTS summary_brief TEXT;"))
                conn.execute(text("ALTER TABLE transcriptions ADD COLUMN IF NOT EXISTS summary_bullets TEXT;"))
                conn.execute(text("ALTER TABLE transcriptions ADD COLUMN IF NOT EXISTS summary_action_items TEXT;"))
                conn.commit()
        except Exception:
            pass
