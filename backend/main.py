from fastapi import FastAPI
import uvicorn
from config import SITE_NAME

app = FastAPI(title=f"{SITE_NAME} API")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Server is running"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)