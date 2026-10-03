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
  Sparkles,
} from "lucide-react";
import { uploadAudio, summarizeTranscriptAction } from "@/app/actions/upload";
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
  const [generateSummary, setGenerateSummary] = useState(false);
  const [formatStyle, setFormatStyle] = useState<string>("brief");
  const [isReSummarizing, setIsReSummarizing] = useState<boolean>(false);
  const [transcriptionId, setTranscriptionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"transcript" | "speakers" | "summary">("transcript");
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
    summary,
    setSummary,
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

  const renderFormattedInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderFormattedSummary = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-3" />;
      }
      if (trimmed.startsWith("### ")) {
        return (
          <h3
            key={idx}
            className="mt-6 mb-2 text-base sm:text-lg font-semibold uppercase tracking-wider text-white/90"
          >
            {trimmed.replace("### ", "")}
          </h3>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={idx} className="mt-7 mb-3 text-xl sm:text-2xl font-semibold text-white tracking-tight">
            {trimmed.replace("## ", "")}
          </h2>
        );
      }
      if (trimmed.startsWith("# ")) {
        return (
          <h1 key={idx} className="mt-8 mb-4 text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {trimmed.replace("# ", "")}
          </h1>
        );
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const bulletText = trimmed.slice(2);
        return (
          <div key={idx} className="ml-2 flex items-start gap-3 py-1.5 text-lg sm:text-xl leading-8 sm:leading-9 text-neutral-200">
            <span className="mt-3.5 h-2 w-2 shrink-0 rounded-full bg-white/70" />
            <span>{renderFormattedInline(bulletText)}</span>
          </div>
        );
      }
      return (
        <p key={idx} className="py-1.5 text-lg sm:text-xl leading-8 sm:leading-9 text-white/90">
          {renderFormattedInline(trimmed)}
        </p>
      );
    });
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

  const handleCopyContent = async () => {
    const textToCopy = activeTab === "summary" ? summary : transcript;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      console.log("[Hero] Content copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[Hero] Copy failed:", err);
    }
  };

  const handleFormatStyleChange = async (newFormat: string | null) => {
    if (!newFormat) return;
    setFormatStyle(newFormat);
    if (!transcript) return;

    try {
      setIsReSummarizing(true);
      const res = await summarizeTranscriptAction({
        transcription_id: transcriptionId || undefined,
        transcript,
        format_style: newFormat,
        language,
      });
      if (res.success && res.summary) {
        setSummary(res.summary);
        toast.add({
          title: "Summary updated",
          type: "success",
        });
      } else {
        toast.add({
          title: res.error || "Failed to update summary",
          type: "error",
        });
      }
    } catch (err) {
      console.error("[Hero] Failed to update summary:", err);
      toast.add({
        title: "Failed to update summary",
        type: "error",
      });
    } finally {
      setIsReSummarizing(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcript) return;
    try {
      setIsReSummarizing(true);
      const res = await summarizeTranscriptAction({
        transcription_id: transcriptionId || undefined,
        transcript,
        format_style: formatStyle,
        language,
      });
      if (res.success && res.summary) {
        setSummary(res.summary);
        setActiveTab("summary");
        toast.add({
          title: "Summary generated",
          type: "success",
        });
      } else {
        toast.add({
          title: res.error || "Failed to generate summary",
          type: "error",
        });
      }
    } catch (err) {
      console.error("[Hero] Failed to generate summary:", err);
      toast.add({
        title: "Failed to generate summary",
        type: "error",
      });
    } finally {
      setIsReSummarizing(false);
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
      setSummary(null);
      setTranscriptionId(null);
      setSegments([]);
      console.log("[Hero] Current state: uploading", {
        name: file.name,
        size: file.size,
        language,
        generateSummary,
        formatStyle,
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);
      formData.append("summarize", "false");
      const userId = (session?.user as { id?: string })?.id;
      if (userId) {
        formData.append("user_id", userId);
      }

      const transcribingTimer = setTimeout(() => {
        setStatus("transcribing");
        console.log("[Hero] Current state: transcribing");
      }, 1000);

      const res = await uploadAudio(formData);
      clearTimeout(transcribingTimer);

      console.log("[Hero] Backend response received:", res);

      if (res.success) {
        if (res.transcription_id) {
          setTranscriptionId(res.transcription_id);
        }
        if (res.transcript) {
          setTranscript(res.transcript);
          setSegments(res.segments || []);

          if (generateSummary) {
            setStatus("summarizing");
            console.log("[Hero] Current state: summarizing");

            const summaryRes = await summarizeTranscriptAction({
              transcription_id: res.transcription_id,
              transcript: res.transcript,
              format_style: formatStyle,
              language,
            });

            if (summaryRes.success && summaryRes.summary) {
              setSummary(summaryRes.summary);
              setActiveTab("summary");
            } else {
              setSummary(null);
              setActiveTab("transcript");
            }

            setStatus("completed");
            console.log("[Hero] Current state: completed with summary");
            toast.add({
              title: "Transcription & Summary complete",
              description:
                res.transcript.slice(0, 100) +
                (res.transcript.length > 100 ? "..." : ""),
              type: "success",
            });
          } else {
            setSummary(null);
            setActiveTab("transcript");
            setStatus("completed");
            console.log("[Hero] Current state: completed without summary");
            toast.add({
              title: "Transcription complete",
              description:
                res.transcript.slice(0, 100) +
                (res.transcript.length > 100 ? "..." : ""),
              type: "success",
            });
          }
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
      const errorMsg =
        err instanceof Error ? err.message : "Failed to connect to server.";
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

        <div className="mt-14 w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-3 flex-1 flex flex-col">
                <div
                  className="
                    flex flex-1 min-h-[340px]
                    flex-col items-center justify-center
                    rounded-2xl
                    border border-dashed border-white/15
                    px-6 py-10
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
            </div>

            <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="mb-2.5 block text-sm font-medium">
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

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02] transition-colors cursor-pointer select-none hover:border-white/20 hover:bg-white/[0.04] ${
                      isUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={generateSummary}
                        onChange={(e) => setGenerateSummary(e.target.checked)}
                        disabled={isUploading}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-white accent-white cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div>
                        <span className="text-sm font-medium text-white">
                          Generate Summary
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Create an AI summary of the conversation
                        </p>
                      </div>
                    </div>
                    <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
                  </label>

                  {generateSummary && (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Summary Format
                      </label>
                      <Select
                        value={formatStyle}
                        onValueChange={(val) => val && setFormatStyle(val)}
                        disabled={isUploading}
                      >
                        <SelectTrigger
                          disabled={isUploading}
                          className="
                            h-10 w-full
                            rounded-xl
                            border-white/10
                            bg-white/[0.03]
                            text-xs
                            text-white
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                          "
                        >
                          <SelectValue placeholder="Select summary format" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="detailed">Detailed (Overview & Action Items)</SelectItem>
                          <SelectItem value="brief">Brief (Concise Overview)</SelectItem>
                          <SelectItem value="bullets">Key Points (Bulleted List)</SelectItem>
                          <SelectItem value="action_items">Action Items & Next Steps</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button
                  size="lg"
                  className="w-full rounded-full h-11"
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
                  {status === "summarizing" && (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Summarizing...
                    </>
                  )}
                  {status !== "uploading" &&
                    status !== "transcribing" &&
                    status !== "summarizing" &&
                    (generateSummary ? "Upload, Transcribe & Summarize" : "Upload & Transcribe")}
                </Button>
              </div>
            </div>
          </div>

          {status !== "idle" && (
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              {status === "uploading" && (
                <div className="flex items-center justify-center gap-2.5 text-sm text-white/90">
                  <Loader2 className="h-4 w-4 animate-spin text-white/80" />
                  <span>Uploading audio to storage...</span>
                </div>
              )}
              {status === "transcribing" && (
                <div className="flex items-center justify-center gap-2.5 text-sm text-white/90">
                  <Loader2 className="h-4 w-4 animate-spin text-white/80" />
                  <span>Transcribing...</span>
                </div>
              )}
              {status === "summarizing" && (
                <div className="flex items-center justify-center gap-2.5 text-sm text-white/90">
                  <Loader2 className="h-4 w-4 animate-spin text-white/80" />
                  <span>Summarizing...</span>
                </div>
              )}
              {status === "completed" && (
                <div className="flex items-center justify-center gap-2 text-sm text-white/90">
                  <CheckCircle2 className="h-4 w-4 text-white/80" />
                  <span>
                    {summary ? "Transcription & summary complete" : "Transcription complete"}
                  </span>
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

          {transcript && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="inline-flex rounded-xl bg-white/[0.04] p-1.5 border border-white/5">
                  {summary && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("summary");
                        console.log("[Hero] Active tab: AI Summary");
                      }}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm sm:text-base font-medium transition-all ${
                        activeTab === "summary"
                          ? "bg-white/15 text-white shadow-sm"
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Sparkles className="h-4 w-4 text-white/80" />
                      AI Summary
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("transcript");
                      console.log("[Hero] Active tab: Full Transcript");
                    }}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm sm:text-base font-medium transition-all ${
                      activeTab === "transcript"
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <FileText className="h-4 w-4 text-white/80" />
                    Full Transcript
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("speakers");
                      console.log("[Hero] Active tab: Multi-Speaker");
                    }}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm sm:text-base font-medium transition-all ${
                      activeTab === "speakers"
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <Users className="h-4 w-4 text-white/80" />
                    Multi-Speaker
                    {segments.length > 0 && (
                      <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80 font-medium">
                        {segments.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {!summary && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isReSummarizing}
                      onClick={handleGenerateSummary}
                      className="h-9 sm:h-10 gap-2 rounded-lg border border-white/15 bg-white/10 px-3.5 sm:px-4 text-xs sm:text-sm font-medium text-white transition-all hover:bg-white/15 active:scale-[0.98]"
                    >
                      {isReSummarizing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>Summarizing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-white/80" />
                          <span>Summarize</span>
                        </>
                      )}
                    </Button>
                  )}
                  <span className="rounded-md bg-white/5 px-3 py-1.5 text-xs sm:text-sm text-muted-foreground">
                    {language}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyContent}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs sm:text-sm text-muted-foreground transition-colors hover:border-white/20 hover:text-white"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-white" />
                        <span className="text-white">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-muted-foreground" />
                        <span>{activeTab === "summary" ? "Copy Summary" : "Copy"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {activeTab === "summary" && summary && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 selection:bg-white/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5 text-sm sm:text-base font-medium text-white/90">
                      <Sparkles className="h-4.5 w-4.5 text-white/80" />
                      <span>Summary</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-xs sm:text-sm text-muted-foreground">Format:</span>
                      <Select
                        value={formatStyle}
                        onValueChange={handleFormatStyleChange}
                        disabled={isReSummarizing}
                      >
                        <SelectTrigger
                          disabled={isReSummarizing}
                          className="h-9 sm:h-10 rounded-xl border-white/10 bg-white/[0.04] px-3 text-xs sm:text-sm text-white min-w-[140px]"
                        >
                          <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="detailed">Detailed</SelectItem>
                          <SelectItem value="brief">Brief</SelectItem>
                          <SelectItem value="bullets">Key Points</SelectItem>
                          <SelectItem value="action_items">Action Items</SelectItem>
                        </SelectContent>
                      </Select>
                      {isReSummarizing && (
                        <Loader2 className="h-4 w-4 animate-spin text-white/70" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {renderFormattedSummary(summary)}
                  </div>
                </div>
              )}

              {activeTab === "transcript" && (
                <div className="space-y-6">
                  <p className="mt-5 text-lg sm:text-xl leading-8 sm:leading-9 text-white/90 whitespace-pre-wrap selection:bg-white/20">
                    {transcript}
                  </p>

                  {!summary && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                          <Sparkles className="h-6 w-6 text-white/90" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                            Generate AI Summary
                          </p>
                          <p className="mt-1 text-sm sm:text-base text-neutral-300 leading-normal">
                            Summarize this transcript into key points, brief overview, or action items.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select
                          value={formatStyle}
                          onValueChange={(val) => val && setFormatStyle(val)}
                          disabled={isReSummarizing}
                        >
                          <SelectTrigger
                            disabled={isReSummarizing}
                            className="h-10 rounded-xl border-white/15 bg-white/[0.05] px-3.5 text-sm text-white min-w-[140px]"
                          >
                            <SelectValue placeholder="Format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="detailed">Detailed</SelectItem>
                            <SelectItem value="brief">Brief</SelectItem>
                            <SelectItem value="bullets">Key Points</SelectItem>
                            <SelectItem value="action_items">Action Items</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          disabled={isReSummarizing}
                          onClick={handleGenerateSummary}
                          className="h-10 gap-2 rounded-xl border border-white/20 bg-white text-black hover:bg-neutral-200 px-5 text-sm font-semibold transition-all active:scale-[0.98]"
                        >
                          {isReSummarizing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-black" />
                              <span>Summarizing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 text-black" />
                              <span>Summarize</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "speakers" && (
                <div className="mt-5 space-y-5">
                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {segments && segments.length > 0 ? (
                      segments.map((seg, idx) => {
                        const speakerNum = seg.speaker_id ?? (idx % 2 === 0 ? 1 : 2);
                        const isSpeaker1 = speakerNum === 1 || speakerNum === "1";
                        return (
                          <div
                            key={seg.segment_id ?? idx}
                            className="rounded-xl border border-white/5 bg-white/[0.015] p-4 transition-colors hover:border-white/10"
                          >
                            <div className="flex items-center justify-between text-xs mb-2.5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium ${
                                  isSpeaker1
                                    ? "bg-white/10 text-white/90 border border-white/15"
                                    : "bg-white/5 text-neutral-300 border border-white/10"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    isSpeaker1 ? "bg-white/80" : "bg-white/50"
                                  }`}
                                />
                                Speaker {speakerNum}
                              </span>
                              <span className="text-muted-foreground font-mono text-[11px]">
                                {formatTime(seg.start_time)} - {formatTime(seg.end_time)}
                              </span>
                            </div>
                            <p className="text-base sm:text-lg text-white/90 leading-relaxed sm:leading-8">
                              {seg.text}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-xl border border-white/5 bg-white/[0.015] p-4">
                        <div className="flex items-center justify-between text-xs mb-2.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium bg-white/10 text-white/90 border border-white/15">
                            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                            Speaker 1
                          </span>
                          <span className="text-muted-foreground font-mono text-[11px]">00:00</span>
                        </div>
                        <p className="text-base sm:text-lg text-white/90 leading-relaxed sm:leading-8">
                          {transcript}
                        </p>
                      </div>
                    )}
                  </div>

                  {!summary && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                          <Sparkles className="h-6 w-6 text-white/90" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                            Generate AI Summary
                          </p>
                          <p className="mt-1 text-sm sm:text-base text-neutral-300 leading-normal">
                            Summarize this transcript into key points, brief overview, or action items.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select
                          value={formatStyle}
                          onValueChange={(val) => val && setFormatStyle(val)}
                          disabled={isReSummarizing}
                        >
                          <SelectTrigger
                            disabled={isReSummarizing}
                            className="h-10 rounded-xl border-white/15 bg-white/[0.05] px-3.5 text-sm text-white min-w-[140px]"
                          >
                            <SelectValue placeholder="Format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="detailed">Detailed</SelectItem>
                            <SelectItem value="brief">Brief</SelectItem>
                            <SelectItem value="bullets">Key Points</SelectItem>
                            <SelectItem value="action_items">Action Items</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          disabled={isReSummarizing}
                          onClick={handleGenerateSummary}
                          className="h-10 gap-2 rounded-xl border border-white/20 bg-white text-black hover:bg-neutral-200 px-5 text-sm font-semibold transition-all active:scale-[0.98]"
                        >
                          {isReSummarizing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-black" />
                              <span>Summarizing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 text-black" />
                              <span>Summarize</span>
                            </>
                          )}
                        </Button>
                      </div>
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