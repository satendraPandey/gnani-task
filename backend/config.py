import os
from dotenv import load_dotenv

load_dotenv()

SITE_NAME = "VoiceNote"

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "")

R2_ENDPOINT_URL = (
    f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com" if R2_ACCOUNT_ID else ""
)

GNANI_API_KEY = os.getenv("GNANI_API_KEY", "")
GNANI_BASE_URL = os.getenv("GNANI_BASE_URL", "https://api.vachana.ai")

DATABASE_URL = os.getenv("DATABASE_URL", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

ALLOWED_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000", "https://gnani-task-z18v.onrender.com", "https://gnani-satendra.vercel.app"]
