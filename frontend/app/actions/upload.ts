"use server";

import { ALLOWED_EXTENSIONS } from "@/config";

export async function uploadAudio(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return { success: false, error: "No file provided" };
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        success: false,
        error: "Unsupported file format. Please upload MP3, WAV, OGG, FLAC, AAC, or M4A.",
      };
    }

    return {
      success: true,
      message: "File uploaded successfully",
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    };

} catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to process upload",
    };
  }
}