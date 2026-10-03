import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Users,
  Sparkles,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
} from "lucide-react";
import { SITE_NAME, LogoSvg } from "@/config";

export default function AboutPage() {
  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full overflow-hidden bg-black text-white selection:bg-white/20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))]" />

      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/90 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-white/80" />
            <span>About {SITE_NAME}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Audio Intelligence for Modern Workflows
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-neutral-400">
            {SITE_NAME} converts recorded speech, meetings, interviews, and discussions into
            high-fidelity transcripts, timestamps, multi-speaker separation, and structured AI summaries.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 transition-colors hover:border-white/20">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 mb-5">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Accurate Transcription</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              High-accuracy speech-to-text engine with support for Indian English, regional languages,
              and global speech accents, capturing conversations clearly and reliably.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 transition-colors hover:border-white/20">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 mb-5">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Multi-Speaker Diarization</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              Distinguishes between different speakers automatically, labeling turns and timestamps
              so you always know who said what throughout the conversation.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 transition-colors hover:border-white/20">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 mb-5">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Gemini AI Summarization</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              Extract insights on demand with 4 targeted formats: Comprehensive detailed summary,
              concise brief overview, key bullet points, or actionable next steps.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 transition-colors hover:border-white/20">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 mb-5">
              <Database className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Cloud Storage & History</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              Past transcriptions and generated summaries are persisted in Neon PostgreSQL and Cloudflare R2,
              allowing instant reload without re-transcribing or rerunning AI models.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.02] p-8 sm:p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 mb-4">
            <LogoSvg className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Ready to transcribe your first audio?
          </h2>
          <p className="mt-2 text-sm text-neutral-400 max-w-md mx-auto">
            Drop an audio file on the home page and experience instant speech-to-text with AI-powered summaries.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link href="/">
              <Button className="h-10 gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-black hover:bg-neutral-200">
                <span>Start Transcribing</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/architecture">
              <Button
                variant="outline"
                className="h-10 rounded-xl border-white/15 bg-white/[0.04] px-5 text-sm font-medium text-white hover:bg-white/10 hover:text-white"
              >
                View Architecture
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}