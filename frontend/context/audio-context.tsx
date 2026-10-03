"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type AudioStatus =
  | "idle"
  | "uploading"
  | "transcribing"
  | "completed"
  | "error";

export interface AudioContextType {
  file: File | null;
  audioUrl: string | null;
  language: string;
  isUploading: boolean;
  status: AudioStatus;
  transcript: string | null;
  error: string | null;
  setFile: (file: File | null) => void;
  setLanguage: (lang: string) => void;
  setIsUploading: (loading: boolean) => void;
  setStatus: (status: AudioStatus) => void;
  setTranscript: (text: string | null) => void;
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
        error,
        setFile,
        setLanguage,
        setIsUploading,
        setStatus,
        setTranscript,
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
