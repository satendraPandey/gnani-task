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