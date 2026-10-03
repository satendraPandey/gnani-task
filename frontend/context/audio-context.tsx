"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface AudioContextType {
  file: File | null;
  audioUrl: string | null;
  language: string;
  isUploading: boolean;
  setFile: (file: File | null) => void;
  setLanguage: (lang: string) => void;
  setIsUploading: (loading: boolean) => void;
  resetAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("en-IN");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    if (!file) {
      setAudioUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const resetAudio = () => {
    setFile(null);
    setAudioUrl(null);
    setIsUploading(false);
  };

  return (
    <AudioContext.Provider
      value={{
        file,
        audioUrl,
        language,
        isUploading,
        setFile,
        setLanguage,
        setIsUploading,
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
