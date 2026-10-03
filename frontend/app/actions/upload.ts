const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function uploadAudio(formData: FormData) {
  try {
    console.log("[UploadAction] Requesting backend:", `${BACKEND_URL}/upload`);
    const res = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    console.log("[UploadAction] Backend status:", res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("[UploadAction] Backend error:", errorData);
      return {
        success: false,
        error: errorData?.detail || `Upload failed with status ${res.status}`,
      };
    }

    const data = await res.json();
    console.log("[UploadAction] Backend response:", data);
    return data;
  } catch (err) {
    console.error("[UploadAction] Network error:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to connect to backend server",
    };
  }
}

export async function summarizeTranscriptAction(payload: {
  transcript?: string;
  transcription_id?: string;
  format_style?: string;
  language?: string;
  user_id?: string;
  filename?: string;
}) {
  try {
    const res = await fetch(`${BACKEND_URL}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.detail || `Summarization failed with status ${res.status}`,
      };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to connect to backend server",
    };
  }
}

export async function getUserTranscriptionsAction(userId: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/transcriptions?user_id=${encodeURIComponent(userId)}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.detail || `Failed to fetch transcriptions with status ${res.status}`,
        transcriptions: [],
      };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to connect to backend server",
      transcriptions: [],
    };
  }
}

export async function getTranscriptionDetailAction(transcriptionId: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/transcriptions/${encodeURIComponent(transcriptionId)}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.detail || `Failed to fetch transcription detail with status ${res.status}`,
      };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to connect to backend server",
    };
  }
}