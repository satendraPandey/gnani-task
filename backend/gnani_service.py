import asyncio
from gnani.stt import GnaniSTTClient
import httpx
from config import GNANI_API_KEY, GNANI_BASE_URL
from storage import get_presigned_url

BATCH_SUPPORTED_LANGUAGES = {
    "bn-IN",
    "en-IN",
    "hi-IN",
    "kn-IN",
    "ml-IN",
    "mr-IN",
    "ta-IN",
    "te-IN",
}


async def request_with_retry(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    headers: dict | None = None,
    json: dict | None = None,
    max_retries: int = 3,
    retry_delay: int = 20,
) -> httpx.Response:
    for attempt in range(max_retries):
        if method == "GET":
            response = await client.get(url, headers=headers)
        elif method == "POST":
            response = await client.post(url, headers=headers, json=json)
        else:
            raise ValueError(f"Unsupported method: {method}")

        if response.status_code == 429 and attempt < max_retries - 1:
            await asyncio.sleep(retry_delay)
            continue

        return response
    return response


async def transcribe_rest(
    audio_bytes: bytes,
    filename: str,
    language_code: str,
) -> dict:
    if not GNANI_API_KEY:
        raise ValueError("GNANI_API_KEY is not configured in environment variables.")

    client = GnaniSTTClient(api_key=GNANI_API_KEY, base_url=GNANI_BASE_URL)
    return await asyncio.to_thread(
        client.transcribe_bytes,
        audio_bytes=audio_bytes,
        filename=filename,
        language_code=language_code,
        format="transcribe",
    )


async def create_batch_job(audio_url: str, language_code: str) -> str:
    if not GNANI_API_KEY:
        raise ValueError("GNANI_API_KEY is not configured in environment variables.")

    url = f"{GNANI_BASE_URL}/stt/v3/batch/jobs"
    headers = {
        "X-API-Key-ID": GNANI_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "config": {
            "model": "gnani-prisma-v2.5",
            "language_code": language_code,
            "mode": "transcribe",
        },
        "source": {
            "type": "cloud_storage",
            "auth": {"mode": "public"},
            "paths": [audio_url],
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await request_with_retry(
            client=client,
            method="POST",
            url=url,
            headers=headers,
            json=payload,
        )
        if response.status_code != 201:
            raise RuntimeError(
                f"Create batch job failed ({response.status_code}): {response.text}"
            )
        data = response.json()
        return data["job_id"]


async def start_batch_job(job_id: str) -> dict:
    url = f"{GNANI_BASE_URL}/stt/v3/batch/jobs/{job_id}/start"
    headers = {"X-API-Key-ID": GNANI_API_KEY}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await request_with_retry(
            client=client,
            method="POST",
            url=url,
            headers=headers,
        )
        if response.status_code != 202:
            raise RuntimeError(
                f"Start batch job failed ({response.status_code}): {response.text}"
            )
        return response.json()


async def get_batch_job_status(job_id: str) -> dict:
    url = f"{GNANI_BASE_URL}/stt/v3/batch/jobs/{job_id}"
    headers = {"X-API-Key-ID": GNANI_API_KEY}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await request_with_retry(
            client=client,
            method="GET",
            url=url,
            headers=headers,
        )
        if response.status_code != 200:
            raise RuntimeError(
                f"Get batch job failed ({response.status_code}): {response.text}"
            )
        return response.json()


async def get_batch_job_files(job_id: str) -> list:
    url = f"{GNANI_BASE_URL}/stt/v3/batch/jobs/{job_id}/files?status=COMPLETED"
    headers = {"X-API-Key-ID": GNANI_API_KEY}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await request_with_retry(
            client=client,
            method="GET",
            url=url,
            headers=headers,
            retry_delay=20,
        )
        if response.status_code != 200:
            raise RuntimeError(
                f"Get job files failed ({response.status_code}): {response.text}"
            )
        data = response.json()
        return data.get("data", [])


async def download_transcript(transcript_url: str) -> dict:
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await request_with_retry(
            client=client,
            method="GET",
            url=transcript_url,
        )
        if response.status_code != 200:
            raise RuntimeError(
                f"Download transcript failed ({response.status_code}): {response.text}"
            )
        return response.json()


async def transcribe_batch_poll(
    audio_url: str,
    language_code: str,
    poll_interval: int = 20,
    timeout: int = 600,
) -> dict:
    job_id = await create_batch_job(audio_url, language_code)
    await start_batch_job(job_id)

    elapsed = 0
    while elapsed < timeout:
        await asyncio.sleep(poll_interval)
        elapsed += poll_interval

        job_data = await get_batch_job_status(job_id)
        status = job_data.get("status")

        if status == "COMPLETED":
            await asyncio.sleep(2)
            files = await get_batch_job_files(job_id)
            if not files or not files[0].get("transcript_url"):
                raise RuntimeError("Batch completed but no transcript URL was returned.")
            transcript_url = files[0]["transcript_url"]
            transcript_data = await download_transcript(transcript_url)
            return {
                "transcript": transcript_data.get("full_transcript", ""),
                "segments": transcript_data.get("segments", []),
                "language_code": transcript_data.get("language_code", language_code),
                "job_id": job_id,
                "method": "batch",
            }

        if status in {"FAILED", "START_FAILED", "CANCELLED", "PARTIAL_FAILURE"}:
            reason = job_data.get("cancel_reason") or "Job terminated with error"
            raise RuntimeError(f"Batch transcription failed with status {status}: {reason}")

    raise TimeoutError("Batch transcription timed out waiting for completion.")


async def smart_transcribe(
    audio_bytes: bytes,
    filename: str,
    content_type: str,
    language_code: str,
    r2_key: str | None = None,
) -> dict:
    file_size = len(audio_bytes)
    is_short = file_size <= 5 * 1024 * 1024
    supports_batch = language_code in BATCH_SUPPORTED_LANGUAGES

    if is_short or not supports_batch:
        try:
            res = await transcribe_rest(
                audio_bytes=audio_bytes,
                filename=filename,
                language_code=language_code,
            )
            return {
                "transcript": res.get("transcript", ""),
                "segments": [],
                "language_code": language_code,
                "duration_seconds": res.get("duration_seconds"),
                "method": "rest_sdk",
            }
        except Exception as e:
            if not supports_batch or not r2_key:
                raise e

    if not supports_batch:
        raise ValueError(
            f"Language {language_code} is not supported for batch transcription and direct transcription failed."
        )

    if not r2_key:
        raise ValueError("Cloud storage key is required for batch transcription.")

    presigned_url = get_presigned_url(r2_key)
    return await transcribe_batch_poll(presigned_url, language_code)
