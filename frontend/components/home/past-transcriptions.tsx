"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
  FileAudio,
  Calendar,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ArrowUpRight,
  Loader2,
  Lock,
  Clock,
  Layers,
} from "lucide-react";
import { getUserTranscriptionsAction, getTranscriptionDetailAction } from "@/app/actions/upload";
import { useAudio, AudioSegment } from "@/context/audio-context";
import { toast } from "../ui/toast";

interface StoredTranscription {
  id: string;
  filename: string;
  status: string;
  language: string;
  full_transcript: string | null;
  summary: string | null;
  summary_detailed?: string | null;
  summary_brief?: string | null;
  summary_bullets?: string | null;
  summary_action_items?: string | null;
  duration_seconds: number | null;
  created_at: string | null;
}

const ITEMS_PER_PAGE = 5;

export default function PastTranscriptions() {
  const { data: session, status: authStatus } = useSession();
  const { setTranscript, setSummary, setSegments, setLanguage, setStatus, setTranscriptionId } = useAudio();

  const [transcriptions, setTranscriptions] = useState<StoredTranscription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingRecordId, setLoadingRecordId] = useState<string | null>(null);

  const userId = useMemo(() => {
    if (!session?.user) return null;
    return (session.user as { id?: string }).id || session.user.email || null;
  }, [session]);

  const fetchTranscriptions = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const res = await getUserTranscriptionsAction(userId);
      if (res.success && Array.isArray(res.transcriptions)) {
        setTranscriptions(res.transcriptions);
      } else {
        setTranscriptions([]);
      }
    } catch (err) {
      console.error("[PastTranscriptions] Fetch error:", err);
      toast.add({
        title: "Failed to load past transcriptions",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTranscriptions();
    }
  }, [userId]);

  const totalPages = Math.max(1, Math.ceil(transcriptions.length / ITEMS_PER_PAGE));

  const currentRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return transcriptions.slice(start, start + ITEMS_PER_PAGE);
  }, [transcriptions, currentPage]);

  const handleCopyTranscript = async (id: string, text: string | null) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.add({
        title: "Transcript copied to clipboard",
        type: "success",
      });
    } catch {
      toast.add({
        title: "Failed to copy transcript",
        type: "error",
      });
    }
  };

  const handleLoadTranscription = async (record: StoredTranscription) => {
    try {
      setLoadingRecordId(record.id);
      const detailRes = await getTranscriptionDetailAction(record.id);

      if (detailRes.success) {
        setTranscriptionId(record.id);
        setTranscript(detailRes.full_transcript || record.full_transcript || "");
        setSummary(detailRes.summary || record.summary || null);
        setLanguage(detailRes.language || record.language || "en-IN");
        setSegments((detailRes.segments as AudioSegment[]) || []);
        setStatus("completed");

        const targetEl = document.getElementById("hero") || document.body;
        targetEl.scrollIntoView({ behavior: "smooth" });

        toast.add({
          title: "Transcription loaded into editor",
          type: "success",
        });
      } else {
        setTranscript(record.full_transcript || "");
        setSummary(record.summary || null);
        setLanguage(record.language || "en-IN");
        setStatus("completed");

        const targetEl = document.getElementById("hero") || document.body;
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      console.error("[PastTranscriptions] Load error:", err);
      toast.add({
        title: "Failed to load transcription details",
        type: "error",
      });
    } finally {
      setLoadingRecordId(null);
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "Recently";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pb-20 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <Layers className="h-4.5 w-4.5 text-white/80" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Past Transcriptions
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            View, search, and reload your previously processed audio files and generated summaries.
          </p>
        </div>

        {userId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchTranscriptions}
            disabled={isLoading}
            className="h-9 gap-2 rounded-xl border-white/10 bg-white/[0.03] px-3.5 text-xs text-white hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        )}
      </div>

      {!userId ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center sm:p-12 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 mb-4">
            <Lock className="h-6 w-6 text-white/70" />
          </div>
          <h3 className="text-lg font-semibold text-white">Sign in to view past transcriptions</h3>
          <p className="mt-1.5 max-w-md mx-auto text-sm text-neutral-400">
            Log in with your Google account to automatically store, organize, and reload your transcription history.
          </p>
          <div className="mt-5">
            <Link href="/login">
              <Button className="h-10 rounded-xl px-5 text-sm font-medium bg-white text-black hover:bg-neutral-200">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : isLoading && transcriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-white/70 mb-3" />
          <p className="text-sm text-muted-foreground">Loading your transcription history...</p>
        </div>
      ) : transcriptions.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center sm:p-12 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 mb-4">
            <FileAudio className="h-6 w-6 text-white/70" />
          </div>
          <h3 className="text-lg font-semibold text-white">No transcriptions yet</h3>
          <p className="mt-1.5 max-w-md mx-auto text-sm text-neutral-400">
            Upload an audio file above to generate your first transcription and AI summary.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-white/[0.03] border-b border-white/10">
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="py-3.5 px-4 text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Audio File
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Language
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Summaries
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Date
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-right text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.map((item) => {
                  const hasSummary = Boolean(
                    item.summary ||
                    item.summary_brief ||
                    item.summary_detailed ||
                    item.summary_bullets ||
                    item.summary_action_items
                  );

                  return (
                    <TableRow
                      key={item.id}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    >
                      <TableCell className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                            <FileAudio className="h-4.5 w-4.5 text-white/80" />
                          </div>
                          <div className="min-w-0 max-w-[220px] sm:max-w-xs md:max-w-sm">
                            <p className="truncate text-sm font-medium text-white" title={item.filename}>
                              {item.filename}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
                              <Clock className="h-3 w-3 text-neutral-500" />
                              <span>{formatDuration(item.duration_seconds)}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-4">
                        <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-neutral-300">
                          {item.language}
                        </span>
                      </TableCell>

                      <TableCell className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.status === "completed"
                              ? "bg-white/10 text-white/90 border border-white/15"
                              : "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.status === "completed" ? "bg-white/80" : "bg-amber-400"
                            }`}
                          />
                          {item.status}
                        </span>
                      </TableCell>

                      <TableCell className="py-4 px-4">
                        {hasSummary ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white">
                              <Sparkles className="h-3 w-3 text-white/80" />
                              AI Ready
                            </span>
                            {item.summary_brief && (
                              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-neutral-400">
                                Brief
                              </span>
                            )}
                            {item.summary_detailed && (
                              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-neutral-400">
                                Detailed
                              </span>
                            )}
                            {item.summary_bullets && (
                              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-neutral-400">
                                Bullets
                              </span>
                            )}
                            {item.summary_action_items && (
                              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-neutral-400">
                                Actions
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-500">None</span>
                        )}
                      </TableCell>

                      <TableCell className="py-4 px-4 text-xs text-neutral-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-neutral-500" />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyTranscript(item.id, item.full_transcript)}
                            disabled={!item.full_transcript}
                            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10"
                            title="Copy Transcript"
                          >
                            {copiedId === item.id ? (
                              <Check className="h-3.5 w-3.5 text-white" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            disabled={loadingRecordId === item.id || !item.full_transcript}
                            onClick={() => handleLoadTranscription(item)}
                            className="h-8 gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 text-xs font-medium text-white transition-all hover:bg-white/15 active:scale-[0.98]"
                          >
                            {loadingRecordId === item.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                            ) : (
                              <>
                                <span>Load</span>
                                <ArrowUpRight className="h-3.5 w-3.5 text-white/80" />
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="text-white font-medium">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="text-white font-medium">
                {Math.min(currentPage * ITEMS_PER_PAGE, transcriptions.length)}
              </span>{" "}
              of{" "}
              <span className="text-white font-medium">{transcriptions.length}</span> past
              transcriptions
            </p>

            {totalPages > 1 && (
              <Pagination className="mx-0 justify-end w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={`cursor-pointer ${
                        currentPage === 1 ? "pointer-events-none opacity-40" : ""
                      }`}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={`cursor-pointer ${
                        currentPage === totalPages ? "pointer-events-none opacity-40" : ""
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
