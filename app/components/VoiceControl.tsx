"use client";

import { useState, useEffect } from "react";

interface VoiceControlProps {
  isListening: boolean;
  transcript: string;
  lastCommand: string | null;
  supported: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function VoiceControl({
  isListening,
  transcript,
  lastCommand,
  supported,
  onStart,
  onStop,
}: VoiceControlProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (!supported) {
    return (
      <div className="text-xs text-red-500 text-center">
        Voice commands not supported in this browser.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Mic Button */}
      <button
        onClick={isListening ? onStop : onStart}
        className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
          isListening
            ? "bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600"
            : "bg-gray-900 text-white hover:bg-gray-700"
        }`}
      >
        {/* Pulse animation when listening */}
        {isListening && (
          <span className="absolute -inset-1 animate-ping rounded-full bg-red-400 opacity-20" />
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
          <path d="M6 11a1 1 0 1 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
        </svg>
        {isListening ? "Listening…" : "Voice"}
      </button>

      {/* Transcript / Last Command */}
      {isListening && (
        <div className="flex-1 min-w-0">
          {lastCommand && (
            <p className="text-xs font-medium text-emerald-600 truncate">
              ✓ {lastCommand}
            </p>
          )}
          {transcript && (
            <p className="text-xs text-gray-400 truncate italic">
              &ldquo;{transcript}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
