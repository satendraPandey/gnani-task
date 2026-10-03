"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mic,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileText,
  Users,
} from "lucide-react";
import { uploadAudio } from "@/app/actions/upload";
import { toast } from "../ui/toast";
import { ACCEPTED_FORMATS, ALLOWED_EXTENSIONS } from "@/config";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAudio } from "@/context/audio-context";

const Hero = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"transcript" | "speakers">("transcript");
  const {
    file,
    setFile,
    isUploading,
    setIsUploading,
    language,
    setLanguage,
    status,
    setStatus,
    transcript,
    setTranscript,
    segments,
    setSegments,
    error,
    setError,
  } = useAudio();
  const { data: session } = useSession();
  const router = useRouter();

  const formatTime = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types?.includes("Files")) {
        dragCounter.current += 1;
        if (dragCounter.current === 1) {
          setIsDragging(true);
        }
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);

      const droppedFile = e.dataTransfer?.files?.[0];
      if (!droppedFile) return;

      const extension = droppedFile.name.split(".").pop()?.toLowerCase();
      if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
        toast.add({
          title: "Unsupported file format",
          description: "Please select an MP3, WAV, OGG, FLAC, AAC, or M4A file.",
          type: "error",
        });
        return;
      }

      console.log("[Hero] File dropped via full-page dropzone:", droppedFile.name);
      setFile(droppedFile);
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [setFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    console.log("[Hero] Audio file selected:", selectedFile.name, `${(selectedFile.size / 1024).toFixed(1)} KB`);

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      console.warn("[Hero] Unsupported format selected:", extension);
      toast.add({
        title: "Unsupported file format",
        description: "Please select an MP3, WAV, OGG, FLAC, AAC, or M4A file.",
        type: "error",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setFile(selectedFile);
  };

  const handleLanguageChange = (val: string | null) => {
    if (!val) return;
    console.log("[Hero] Language chosen:", val);
    setLanguage(val);
  };

  const handleCopyTranscript = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      console.log("[Hero] Transcript copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[Hero] Copy failed:", err);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.warn("[Hero] Upload clicked without a file");
      toast.add({ title: "Please choose an audio file first.", type: "warning" });
      return;
    }

    if (!session || !session?.user) {
      console.warn("[Hero] Upload clicked without authenticated session");
      toast.add({
        title: "Please Login!",
        type: "warning",
      });
      router.push("/login");
      return;
    }

    try {
      setIsUploading(true);
      setStatus("uploading");
      setError(null);
      setTranscript(null);
      setSegments([]);
      console.log("[Hero] Current state: uploading", { name: file.name, size: file.size, language });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);
      const userId = (session?.user as { id?: string })?.id;
      if (userId) {
        formData.append("user_id", userId);
      }

      const transcribingTimer = setTimeout(() => {
        setStatus("transcribing");
        console.log("[Hero] Current state: transcribing with Gnani AI");
      }, 1000);

      const res = await uploadAudio(formData);
      clearTimeout(transcribingTimer);

      console.log("[Hero] Backend response received:", res);

      if (res.success) {
        if (res.transcript) {
          setStatus("completed");
          setTranscript(res.transcript);
          setSegments(res.segments || []);
          console.log("[Hero] Current state: completed", {
            transcript: res.transcript,
            segmentsCount: res.segments?.length || 0,
            method: res.method,
          });
          toast.add({
            title: "Transcription complete",
            description: res.transcript.slice(0, 100) + (res.transcript.length > 100 ? "..." : ""),
            type: "success",
          });
        } else if (res.transcription_error) {
          setStatus("error");
          setError(res.transcription_error);
          console.warn("[Hero] Current state: error", res.transcription_error);
          toast.add({
            title: "Audio uploaded",
            description: res.transcription_error,
            type: "warning",
          });
        } else {
          setStatus("completed");
          console.log("[Hero] Current state: completed (no transcript text)");
          toast.add({ title: res.message, type: "success" });
        }
      } else {
        setStatus("error");
        setError(res.error || "Upload failed");
        console.error("[Hero] Current state: error", res.error);
        toast.add({ title: res.error, type: "error" });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to connect to server.";
      setStatus("error");
      setError(errorMsg);
      console.error("[Hero] Current state: error", err);
      toast.add({
        title: "Upload failed",
        description: errorMsg,
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-80px)] px-6 py-20 relative">
      {isDragging && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md border-4 border-dashed border-white/40 pointer-events-none animate-in fade-in-0 duration-200">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-2xl animate-bounce">
            <Upload className="h-12 w-12 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-semibold text-white tracking-tight">
            Drop your audio file here
          </h2>
          <p className="mt-2 text-sm text-neutral-300">
            Supports MP3, WAV, OGG, FLAC, AAC, M4A
          </p>
        </div>
      )}

      <div className="mx-auto flex max-w-6xl flex-col items-center">
        <div className="max-w-3xl text-center">
          <p className="mb-5 text-sm font-medium text-muted-foreground">
            AI-powered audio transcription
          </p>

          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Turn your audio into
            <span className="block">
              accurate text with AI
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
            Upload your audio and get accurate transcripts and
            AI-generated summaries in one place.
          </p>
        </div>

        <div className="mt-14 w-full max-w-3xl">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-3">
            <div
              className="
                flex min-h-[300px]
                flex-col items-center justify-center
                rounded-2xl
                border border-dashed border-white/15
                px-6 py-12
                text-center
                transition-colors
                hover:border-white/30
              "
            >
              <div
                className="
                  flex h-16 w-16
                  items-center justify-center
                  rounded-2xl
                  border border-white/10
                  bg-white/[0.04]
                "
              >
                <Mic className="h-8 w-8 text-white/80" />
              </div>

              <h2 className="mt-6 text-xl font-medium">
                {file ? file.name : "Drop your audio here"}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {file
                  ? `${(file.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload`
                  : "Drag and drop your file or choose one from your computer"}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FORMATS}
                className="hidden"
                onChange={handleFileChange}
              />

              <Button
                type="button"
                size="lg"
                className="mt-7 rounded-full px-7"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {file ? "Change Audio" : "Choose Audio"}
              </Button>

              <p className="mt-4 text-xs text-muted-foreground">
                MP3 · WAV · OGG · FLAC · AAC · M4A
              </p>
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <label className="mb-3 block text-sm font-medium">
              Language
            </label>

            <Select
              value={language}
              onValueChange={handleLanguageChange}
              disabled={isUploading}
            >
              <SelectTrigger
                disabled={isUploading}
                className="
                  h-11 w-full
                  rounded-xl
                  border-white/10
                  bg-white/[0.03]
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                <SelectValue placeholder="Select language" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="en-IN">English</SelectItem>
                <SelectItem value="hi-IN">Hindi</SelectItem>
                <SelectItem value="bn-IN">Bengali</SelectItem>
                <SelectItem value="gu-IN">Gujarati</SelectItem>
                <SelectItem value="kn-IN">Kannada</SelectItem>
                <SelectItem value="ml-IN">Malayalam</SelectItem>
                <SelectItem value="mr-IN">Marathi</SelectItem>
                <SelectItem value="pa-IN">Punjabi</SelectItem>
                <SelectItem value="ta-IN">Tamil</SelectItem>
                <SelectItem value="te-IN">Telugu</SelectItem>
              </SelectContent>
            </Select>

            <p className="mt-2 text-xs text-muted-foreground">
              Select the language spoken in your audio
            </p>
          </div>

          {status !== "idle" && (
            <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              {status === "uploading" && (
                <div className="flex items-center justify-center gap-2.5 text-sm text-amber-300">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                  <span>Uploading audio to storage...</span>
                </div>
              )}
              {status === "transcribing" && (
                <div className="flex items-center justify-center gap-2.5 text-sm text-sky-300">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                  <span>Transcribing with Gnani AI...</span>
                </div>
              )}
              {status === "completed" && (
                <div className="flex items-center justify-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Transcription complete</span>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center justify-center gap-2 text-sm text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="truncate">{error || "Transcription failed"}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-7 flex justify-center">
            <Button
              size="lg"
              className="rounded-full px-8"
              onClick={handleUpload}
              disabled={isUploading || !file}
            >
              {status === "uploading" && (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              )}
              {status === "transcribing" && (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transcribing...
                </>
              )}
              {status !== "uploading" && status !== "transcribing" && "Upload & Transcribe"}
            </Button>
          </div>

          {transcript && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="inline-flex rounded-xl bg-white/[0.04] p-1 border border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("transcript");
                      console.log("[Hero] Active tab: Full Transcript");
                    }}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                      activeTab === "transcript"
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Full Transcript
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("speakers");
                      console.log("[Hero] Active tab: Multi-Speaker");
                    }}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                      activeTab === "speakers"
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Multi-Speaker
                    {segments.length > 0 && (
                      <span className="ml-1 rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-300">
                        {segments.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-muted-foreground">
                    {language}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTranscript}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-white/20 hover:text-white"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {activeTab === "transcript" && (
                <p className="mt-5 text-base leading-relaxed text-white/90 whitespace-pre-wrap selection:bg-emerald-500/20">
                  {transcript}
                </p>
              )}

              {activeTab === "speakers" && (
                <div className="mt-5 space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                  {segments && segments.length > 0 ? (
                    segments.map((seg, idx) => {
                      const speakerNum = seg.speaker_id ?? (idx % 2 === 0 ? 1 : 2);
                      const isSpeaker1 = speakerNum === 1 || speakerNum === "1";
                      return (
                        <div
                          key={seg.segment_id ?? idx}
                          className="rounded-xl border border-white/5 bg-white/[0.015] p-4 transition-colors hover:border-white/10"
                        >
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium ${
                                isSpeaker1
                                  ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isSpeaker1 ? "bg-indigo-400" : "bg-emerald-400"
                                }`}
                              />
                              Speaker {speakerNum}
                            </span>
                            <span className="text-muted-foreground font-mono text-[11px]">
                              {formatTime(seg.start_time)} - {formatTime(seg.end_time)}
                            </span>
                          </div>
                          <p className="text-sm text-white/85 leading-relaxed">
                            {seg.text}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-white/5 bg-white/[0.015] p-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                          Speaker 1
                        </span>
                        <span className="text-muted-foreground font-mono text-[11px]">00:00</span>
                      </div>
                      <p className="text-sm text-white/85 leading-relaxed">
                        {transcript}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;