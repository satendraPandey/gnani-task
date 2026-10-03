"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, Upload, Loader2, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import { uploadAudio } from "@/app/actions/upload";
import { toast } from "../ui/toast";
import { ACCEPTED_FORMATS, ALLOWED_EXTENSIONS } from "@/config";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAudio } from "@/context/audio-context";

const Hero = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
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
    error,
    setError,
  } = useAudio();
  const { data: session } = useSession();
  const router = useRouter();

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
      console.log("[Hero] Current state: uploading", { name: file.name, size: file.size, language });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);

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
          console.log("[Hero] Current state: completed", { transcript: res.transcript, method: res.method });
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
    <section className="min-h-[calc(100vh-80px)] px-6 py-20">
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

            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger
                className="
                  h-11 w-full
                  rounded-xl
                  border-white/10
                  bg-white/[0.03]
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
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-medium text-white/90">Transcription Result</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                    {language}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTranscript}
                    className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-white"
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
              <p className="mt-4 text-lg leading-10 text-white/90 whitespace-pre-wrap selection:bg-emerald-500/20">
                {transcript}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;