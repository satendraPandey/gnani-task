import os
from google import genai
from config import GEMINI_API_KEY

FALLBACK_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.8-flash",
]


def get_genai_client():
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured in backend/.env")
    return genai.Client(api_key=GEMINI_API_KEY)


def build_summary_prompt(transcript: str, format_style: str = "brief", language: str = "en") -> str:
    lang_instruction = (
        f"Provide the response in {language}."
        if language and language.lower() not in ["en", "en-in", "en-us"]
        else "Provide the response in clear English."
    )

    if format_style == "brief":
        style_prompt = "Provide a concise summary in 2 to 4 sentences highlighting the main points."
    elif format_style == "bullets":
        style_prompt = "Provide a bulleted list of the key points, decisions, and outcomes discussed."
    elif format_style == "action_items":
        style_prompt = "List all actionable tasks, assignments, deadlines, and next steps identified in the conversation."
    else:
        style_prompt = (
            "Structure your summary with the following markdown sections:\n"
            "### Overview\n"
            "A concise 2-3 sentence executive summary.\n\n"
            "### Key Highlights\n"
            "Bullet points covering main topics and findings.\n\n"
            "### Next Steps & Action Items\n"
            "Any tasks, follow-ups, or action items mentioned (or state 'None mentioned' if none)."
        )

    return f"""You are an expert audio transcription analyzer and summarizer.
{lang_instruction}

{style_prompt}

Transcript:
\"\"\"
{transcript}
\"\"\"
"""


async def summarize_transcript(
    transcript: str,
    format_style: str = "detailed",
    language: str = "en",
) -> str:
    if not transcript or not transcript.strip():
        raise ValueError("Transcript is empty.")

    client = get_genai_client()
    prompt = build_summary_prompt(transcript, format_style=format_style, language=language)

    last_error = None
    for model_name in FALLBACK_MODELS:
        try:
            chat = client.aio.chats.create(model=model_name)
            response = await chat.send_message(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            last_error = e
            continue

    raise RuntimeError(f"Failed to generate summary with Gemini models: {str(last_error)}")
