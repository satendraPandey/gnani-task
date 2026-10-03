"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, ArrowRight, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME, LogoSvg } from "@/config";

type TabKey = "overview" | "pipeline" | "stack" | "database" | "ai_stt" | "api";

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "pipeline", label: "Data Pipeline" },
    { key: "ai_stt", label: "Speech & AI Engine" },
    { key: "database", label: "Database Schema" },
    { key: "api", label: "API Reference" },
    { key: "stack", label: "Tech Stack" },
  ];

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full overflow-hidden bg-black text-white selection:bg-white/20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))]" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs sm:text-sm font-medium text-white/90 mb-8">
            Technical Architecture &amp; System Specifications
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            System Architecture
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-base sm:text-xl leading-relaxed text-neutral-300">
            A high-throughput audio ingestion, speech recognition, multi-speaker diarization,
            and AI summarization platform built on Next.js 16, FastAPI, Gnani.ai, Google Gemini, and Neon PostgreSQL.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/">
              <Button className="h-11 gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-black hover:bg-neutral-200">
                <span>Open Application</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a
              href="https://github.com/satendraPandey/gnani-task"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="outline"
                className="h-11 gap-2 rounded-xl border-white/15 bg-white/[0.04] px-6 text-sm font-medium text-white hover:bg-white/10 hover:text-white"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="h-4 w-4 text-neutral-400" />
              </Button>
            </a>
          </div>
        </div>

        <div className="mt-16 flex justify-center overflow-x-auto pb-4">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-2 backdrop-blur-md">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-black shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 space-y-16">
          {(activeTab === "overview" || activeTab === "pipeline") && (
            <section className="space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  High-Level Architecture &amp; Data Flow
                </h2>
                <p className="text-sm sm:text-base text-neutral-400 mt-2 leading-relaxed">
                  End-to-end request lifecycle from audio capture to persistent diarized transcripts and multi-format AI summaries.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-white/20">
                  <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3">
                    Layer 01
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Client Presentation
                  </h3>
                  <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                    Next.js 16 App Router with React 19, Base UI, Shadcn, NextAuth.js session synchronization, and in-memory dual cache.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300">
                      Next.js 16
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300">
                      React 19
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300">
                      Tailwind v4
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-white/20">
                  <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3">
                    Layer 02
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    API Gateway
                  </h3>
                  <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                    FastAPI ASGI service running Python 3.12, orchestrating multipart file uploads, background batch jobs, and CORS policies.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300">
                      FastAPI
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300">
                      Uvicorn
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300">
                      Pydantic v2
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-white/20">
                  <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3">
                    Layer 03
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Speech &amp; AI Inference
                  </h3>
                  <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                    Gnani.ai ASR with acoustic speaker diarization, paired with Google Gemini 2.5 Flash for 4-style structured summaries.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300">
                      Gnani STT
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300">
                      Gemini 2.5
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300">
                      Diarization
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-white/20">
                  <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3">
                    Layer 04
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Data Persistence
                  </h3>
                  <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                    Neon Serverless PostgreSQL for relational transcript history and Cloudflare R2 for binary audio object storage.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300">
                      Neon Postgres
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300">
                      Cloudflare R2
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300">
                      SQLAlchemy
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-8 sm:p-10 space-y-8">
                <div className="text-sm font-semibold uppercase tracking-wider text-neutral-300">
                  Pipeline Execution Steps
                </div>

                <div className="space-y-8">
                  <div className="flex items-start gap-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-semibold text-white">
                      1
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-base sm:text-lg font-semibold text-white">
                          Audio Ingestion &amp; Object Storage
                        </span>
                        <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-mono text-neutral-300">
                          POST /upload
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                        Client uploads audio (MP3, WAV, OGG, FLAC, AAC, M4A). The server validates the MIME format, assigns a unique UUID key, and streams raw bytes to Cloudflare R2 using AWS SigV4 authorization.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-semibold text-white">
                      2
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-base sm:text-lg font-semibold text-white">
                          Smart STT &amp; Speaker Diarization Routing
                        </span>
                        <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-mono text-neutral-300">
                          smart_transcribe()
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                        Files under 5MB execute synchronously via the Gnani REST SDK for rapid response. Files exceeding 5MB trigger an asynchronous batch job via presigned R2 URLs, invoking <code className="text-neutral-200">gnani-prisma-v2.5</code> with multi-speaker acoustic clustering and timestamp alignment.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-semibold text-white">
                      3
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-base sm:text-lg font-semibold text-white">
                          AI Synthesis with Resilient Fallback Cascade
                        </span>
                        <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-mono text-neutral-300">
                          summarize_transcript()
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                        Google Gemini synthesizes structured executive summaries across 4 distinct formats. If rate limits are encountered, the system automatically falls back through alternate models: <code className="text-neutral-200">gemini-3.5-flash-lite</code> &rarr; <code className="text-neutral-200">gemini-3.1-flash-lite</code> &rarr; <code className="text-neutral-200">gemini-flash-latest</code>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-semibold text-white">
                      4
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-base sm:text-lg font-semibold text-white">
                          Relational Persistence &amp; Dual-Layer Caching
                        </span>
                        <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-mono text-neutral-300">
                          Neon DB &amp; AudioContext
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                        Transcripts, timestamps, speaker segments, and summaries are atomically committed into Neon PostgreSQL. Client-side React context caches summaries for instantaneous tab switching without redundant server requests.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {(activeTab === "overview" || activeTab === "ai_stt") && (
            <section className="space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Speech Intelligence &amp; Generative AI
                </h2>
                <p className="text-sm sm:text-base text-neutral-400 mt-2 leading-relaxed">
                  Multi-speaker acoustic diarization and Gemini-powered multi-style cognitive summaries.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Gnani.ai Speech Recognition
                    </h3>
                    <p className="text-sm text-neutral-400 mt-1">
                      Model: gnani-prisma-v2.5
                    </p>
                  </div>

                  <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                    Gnani.ai provides automatic speech recognition optimized for Indian accents, regional phonetics, and noisy recording environments.
                  </p>

                  <div className="space-y-5">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-2">
                      <div className="text-sm sm:text-base font-semibold text-white">
                        Speaker Diarization Architecture
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                        Segments audio streams into individual speaker turns with sub-second timestamps (<code className="text-neutral-300 font-mono">start_time</code>, <code className="text-neutral-300 font-mono">end_time</code>) and assigns deterministic speaker IDs (<code className="text-neutral-300 font-mono">Speaker 0</code>, <code className="text-neutral-300 font-mono">Speaker 1</code>).
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-2">
                      <div className="text-sm sm:text-base font-semibold text-white">
                        Dual Ingestion Strategy
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                        Synchronous REST SDK for files &le; 5MB ensures low-latency responses. Files &gt; 5MB leverage an asynchronous batch polling pipeline with rate-limit backoff and automatic retry.
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-3">
                      <div className="text-sm sm:text-base font-semibold text-white">
                        Supported Indic Languages
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "en-IN (Indian English)",
                          "hi-IN (Hindi)",
                          "ta-IN (Tamil)",
                          "te-IN (Telugu)",
                          "kn-IN (Kannada)",
                          "ml-IN (Malayalam)",
                          "mr-IN (Marathi)",
                          "bn-IN (Bengali)",
                        ].map((lang) => (
                          <span
                            key={lang}
                            className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Google Gemini AI Engine
                    </h3>
                    <p className="text-sm text-neutral-400 mt-1">
                      google-genai SDK &bull; Multi-Format Synthesis
                    </p>
                  </div>

                  <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                    Google Gemini 2.5 Flash processes raw transcription text into 4 structured summary styles with multi-tiered fallback resiliency.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1">
                      <div className="text-sm font-semibold text-white">
                        Detailed
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Executive overview, highlights &amp; next steps.
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1">
                      <div className="text-sm font-semibold text-white">
                        Brief
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Concise 2-4 sentence executive digest.
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1">
                      <div className="text-sm font-semibold text-white">
                        Bullet Points
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Key decisions and core outcome takeaways.
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-1">
                      <div className="text-sm font-semibold text-white">
                        Action Items
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Assigned tasks, owners, and deadlines.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-3">
                    <div className="text-sm sm:text-base font-semibold text-white">
                      Zero-Cost Dual Layer Caching
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      Generated summaries are cached at two layers:
                      <br />
                      <span className="font-semibold text-neutral-200">L1 Client Cache:</span> React context state retains responses for instant UI switching.
                      <br />
                      <span className="font-semibold text-neutral-200">L2 Database Cache:</span> Backend queries check Neon DB columns first, returning <code className="text-neutral-300 font-mono">cached: true</code> in under 15ms without invoking Gemini API tokens.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {(activeTab === "overview" || activeTab === "database") && (
            <section className="space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Neon PostgreSQL Schema Architecture
                </h2>
                <p className="text-sm sm:text-base text-neutral-400 mt-2 leading-relaxed">
                  Normalized relational data model designed for audio transcripts, speaker segments, and structured summaries.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-base sm:text-lg font-mono font-semibold text-white">
                      transcriptions
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      Primary Entity
                    </span>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm font-mono">
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-neutral-200">id</span>
                      <span className="text-neutral-400">VARCHAR (PK, UUID)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-neutral-200">user_id</span>
                      <span className="text-neutral-400">VARCHAR (FK &rarr; users.id)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-neutral-200">filename</span>
                      <span className="text-neutral-400">VARCHAR NOT NULL</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-neutral-200">file_key</span>
                      <span className="text-neutral-400">VARCHAR (INDEX)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-neutral-200">file_size</span>
                      <span className="text-neutral-400">INTEGER</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-neutral-200">language</span>
                      <span className="text-neutral-400">VARCHAR (default en-IN)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-neutral-200">status</span>
                      <span className="text-neutral-400">VARCHAR (INDEX)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-neutral-200">full_transcript</span>
                      <span className="text-neutral-400">TEXT</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-neutral-200">summary_detailed</span>
                      <span className="text-neutral-400">TEXT (Cached)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-neutral-200">summary_brief</span>
                      <span className="text-neutral-400">TEXT (Cached)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-neutral-200">summary_bullets</span>
                      <span className="text-neutral-400">TEXT (Cached)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-neutral-200">summary_action_items</span>
                      <span className="text-neutral-400">TEXT (Cached)</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-neutral-200">duration_seconds</span>
                      <span className="text-neutral-400">FLOAT</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="text-base sm:text-lg font-mono font-semibold text-white">
                        segments
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        Speaker Turn Data
                      </span>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm font-mono">
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-neutral-200">id</span>
                        <span className="text-neutral-400">VARCHAR (PK, UUID)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-neutral-200">transcription_id</span>
                        <span className="text-neutral-400">VARCHAR (FK, CASCADE)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-neutral-200">speaker_id</span>
                        <span className="text-neutral-400">INTEGER (e.g. 0, 1)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-neutral-200">start_time / end_time</span>
                        <span className="text-neutral-400">FLOAT (Seconds)</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-neutral-200">text</span>
                        <span className="text-neutral-400">TEXT NOT NULL</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="text-base sm:text-lg font-mono font-semibold text-white">
                        summaries
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        Format Persistence
                      </span>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm font-mono">
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-neutral-200">id</span>
                        <span className="text-neutral-400">VARCHAR (PK, UUID)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-neutral-200">transcription_id</span>
                        <span className="text-neutral-400">VARCHAR (FK, CASCADE)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-neutral-200">format_style</span>
                        <span className="text-neutral-400">VARCHAR (INDEX)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-neutral-200">content</span>
                        <span className="text-neutral-400">TEXT NOT NULL</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-neutral-200">language</span>
                        <span className="text-neutral-400">VARCHAR (default en)</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="text-base sm:text-lg font-mono font-semibold text-white">
                        users
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        NextAuth Session Sync
                      </span>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm font-mono">
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-neutral-200">id</span>
                        <span className="text-neutral-400">VARCHAR (PK, UUID)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-neutral-200">email</span>
                        <span className="text-neutral-400">VARCHAR UNIQUE (INDEX)</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-neutral-200">name / image</span>
                        <span className="text-neutral-400">VARCHAR NULL</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {(activeTab === "overview" || activeTab === "api") && (
            <section className="space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  REST API Endpoint Specifications
                </h2>
                <p className="text-sm sm:text-base text-neutral-400 mt-2 leading-relaxed">
                  FastAPI endpoints supporting audio uploads, diarized transcripts, and format-specific summaries.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    method: "POST",
                    path: "/upload",
                    desc: "Multipart audio ingestion, R2 storage, STT diarization, and DB commit.",
                    payload: "FormData { file: File, language: 'en-IN', user_id: string, summarize: bool, format_style: 'detailed' }",
                    response: "{ success: true, transcription_id: 'uuid', transcript: '...', segments: [...], summary: '...' }",
                  },
                  {
                    method: "POST",
                    path: "/summarize",
                    desc: "Format-specific summary generation with Neon DB cache lookup and Gemini fallback.",
                    payload: "JSON { transcription_id: 'uuid', format_style: 'brief' | 'detailed' | 'bullets' | 'action_items', language: 'en' }",
                    response: "{ success: true, summary: '...', cached: true, summaries: { detailed, brief, bullets, action_items } }",
                  },
                  {
                    method: "GET",
                    path: "/transcriptions",
                    desc: "Retrieves user's past transcriptions with status, duration, and summaries.",
                    payload: "Query: ?user_id=<user_id_or_email>",
                    response: "{ success: true, transcriptions: [{ id, filename, status, language, summary, created_at }, ...] }",
                  },
                  {
                    method: "GET",
                    path: "/transcriptions/{id}",
                    desc: "Detailed record including timestamped speaker diarization segments.",
                    payload: "Path Param: id=<transcription_uuid>",
                    response: "{ success: true, id, filename, full_transcript, segments: [{ speaker_id, start_time, end_time, text }], ... }",
                  },
                  {
                    method: "POST",
                    path: "/auth/sync-user",
                    desc: "Synchronizes authenticated NextAuth user profile into Neon PostgreSQL.",
                    payload: "JSON { email: string, name: string, image: string }",
                    response: "{ success: true, id: 'uuid', email: '...', name: '...' }",
                  },
                  {
                    method: "GET",
                    path: "/jobs/{job_id}",
                    desc: "Polls Gnani.ai asynchronous batch speech-to-text job status.",
                    payload: "Path Param: job_id=<gnani_job_id>",
                    response: "{ status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED', ... }",
                  },
                ].map((endpoint) => (
                  <div
                    key={endpoint.path + endpoint.method}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 sm:p-8 space-y-4 transition-all hover:border-white/20"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-md px-3 py-1 text-xs font-mono font-bold ${
                            endpoint.method === "POST"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {endpoint.method}
                        </span>
                        <code className="text-base sm:text-lg font-mono font-semibold text-white">
                          {endpoint.path}
                        </code>
                      </div>

                      <button
                        onClick={() => copyToClipboard(endpoint.path, endpoint.path)}
                        className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
                      >
                        {copiedKey === endpoint.path ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Path</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                      {endpoint.desc}
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="rounded-xl border border-white/10 bg-black/50 p-4 space-y-2">
                        <span className="text-xs uppercase tracking-wider text-neutral-400 block font-sans font-semibold">
                          Request Payload
                        </span>
                        <code className="text-neutral-300 break-all block leading-relaxed">
                          {endpoint.payload}
                        </code>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/50 p-4 space-y-2">
                        <span className="text-xs uppercase tracking-wider text-neutral-400 block font-sans font-semibold">
                          Expected Response
                        </span>
                        <code className="text-neutral-300 break-all block leading-relaxed">
                          {endpoint.response}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(activeTab === "overview" || activeTab === "stack") && (
            <section className="space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Technology Stack Matrix &amp; Official Docs
                </h2>
                <p className="text-sm sm:text-base text-neutral-400 mt-2 leading-relaxed">
                  Industry standard tools and platforms powering VoiceNote audio processing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: "Next.js 16",
                    category: "Frontend Framework",
                    desc: "React 19 Server Components, App Router, Turbopack, and client state orchestration.",
                    docs: "https://nextjs.org/docs",
                  },
                  {
                    name: "FastAPI",
                    category: "Backend REST API",
                    desc: "High-performance Python 3.12 ASGI service with Pydantic v2 data validation.",
                    docs: "https://fastapi.tiangolo.com",
                  },
                  {
                    name: "Gnani.ai STT",
                    category: "Speech Recognition & Diarization",
                    desc: "gnani-prisma-v2.5 model supporting 8 Indic languages and multi-speaker turn clustering.",
                    docs: "https://gnani.ai/",
                  },
                  {
                    name: "Google Gemini",
                    category: "Generative AI",
                    desc: "Gemini 2.5 Flash & Flash Lite with prompt engineering for 4 distinct synthesis styles.",
                    docs: "https://ai.google.dev/docs",
                  },
                  {
                    name: "Neon PostgreSQL",
                    category: "Serverless Database",
                    desc: "Cloud-native PostgreSQL with auto-scaling compute, connection pooling, and branch support.",
                    docs: "https://neon.tech/docs",
                  },
                  {
                    name: "Cloudflare R2",
                    category: "Object Storage",
                    desc: "S3-compatible zero-egress bucket storing binary audio with AWS SigV4 presigned URLs.",
                    docs: "https://developers.cloudflare.com/r2/",
                  },
                  {
                    name: "Tailwind CSS v4",
                    category: "Design System",
                    desc: "Modern CSS framework providing dark minimalist styling and hardware-accelerated transitions.",
                    docs: "https://tailwindcss.com/docs",
                  },
                  {
                    name: "SQLAlchemy 2.0",
                    category: "Python ORM",
                    desc: "Declarative mapping, relational foreign key cascades, and connection session pooling.",
                    docs: "https://docs.sqlalchemy.org",
                  },
                  {
                    name: "NextAuth.js",
                    category: "Authentication",
                    desc: "OAuth session management with server-side token validation and Neon DB sync.",
                    docs: "https://next-auth.js.org",
                  },
                ].map((tech) => (
                  <div
                    key={tech.name}
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-all hover:border-white/20 hover:bg-white/[0.03]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                          {tech.category}
                        </span>
                        <a
                          href={tech.docs}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-500 hover:text-white transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        {tech.name}
                      </h3>
                      <p className="text-sm leading-relaxed text-neutral-400">
                        {tech.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5">
                      <a
                        href={tech.docs}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-white"
                      >
                        <span>Official Documentation</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="mt-20 rounded-2xl border border-white/10 bg-white/[0.02] p-10 sm:p-14 text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <LogoSvg className="h-7 w-7 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ready to experience the architecture in action?
            </h2>
            <p className="text-base sm:text-lg text-neutral-400 max-w-lg mx-auto leading-relaxed">
              Upload an audio recording to trigger speech-to-text diarization and Gemini AI synthesis.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/">
              <Button className="h-11 gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-black hover:bg-neutral-200">
                <span>Start Transcribing</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                className="h-11 rounded-xl border-white/15 bg-white/[0.04] px-6 text-sm font-medium text-white hover:bg-white/10 hover:text-white"
              >
                About Project
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
