import { NextResponse } from "next/server";
import { ALLOWED_EXTENSIONS } from "@/config";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file format. Please upload MP3, WAV, OGG, FLAC, AAC, or M4A.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to process upload",
      },
      { status: 500 }
    );
  }
}
