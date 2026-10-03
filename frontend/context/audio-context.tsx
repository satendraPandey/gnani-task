"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type AudioStatus =
  | "idle"
  | "uploading"
  | "transcribing"
  | "completed"
  | "error";

export interface AudioSegment {
  segment_id?: number;
  start_time?: number;
  end_time?: number;
  speaker_id?: number | string | null;
  text: string;
}

export interface AudioContextType {
  file: File | null;
  audioUrl: string | null;
  language: string;
  isUploading: boolean;
  status: AudioStatus;
  transcript: string | null;
  segments: AudioSegment[];
  error: string | null;
  setFile: (file: File | null) => void;
  setLanguage: (lang: string) => void;
  setIsUploading: (loading: boolean) => void;
  setStatus: (status: AudioStatus) => void;
  setTranscript: (text: string | null) => void;
  setSegments: (segments: AudioSegment[]) => void;
  setError: (err: string | null) => void;
  resetAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("en-IN");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setAudioUrl(null);
      return;
    }

    console.log("[AudioContext] File selected:", file.name, `${(file.size / 1024).toFixed(1)} KB`);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setStatus("idle");
    setTranscript(null);
    setSegments([]);
    setError(null);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const resetAudio = () => {
    console.log("[AudioContext] Audio state reset");
    setFile(null);
    setAudioUrl(null);
    setIsUploading(false);
    setStatus("idle");
    setTranscript(null);
    setSegments([]);
    setError(null);
  };

  return (
    <AudioContext.Provider
      value={{
        file,
        audioUrl,
        language,
        isUploading,
        status,
        transcript,
        segments,
        error,
        setFile,
        setLanguage,
        setIsUploading,
        setStatus,
        setTranscript,
        setSegments,
        setError,
        resetAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
