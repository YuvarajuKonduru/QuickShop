"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import type { Product } from "@/app/types/product";

export interface VoiceCommandActions {
  onSearch: (query: string) => void;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onClear: () => void;
  onScrollUp: () => void;
  onScrollDown: () => void;
  products: Product[];
}

export interface VoiceCommandResult {
  isListening: boolean;
  transcript: string;
  lastCommand: string | null;
  startListening: () => void;
  stopListening: () => void;
  browserSupportsSpeechRecognition: boolean;
}

export function useVoiceCommands(
  actions: VoiceCommandActions
): VoiceCommandResult {
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const actionsRef = useRef(actions);

  useEffect(() => {
    actionsRef.current = actions;
  });

  const handleSearch = (query: string) => {
    setLastCommand(`Search: "${query}"`);
    actionsRef.current.onSearch(query);
  };

  const commands = [
    { command: "search for *", callback: handleSearch },
    { command: "search *", callback: handleSearch },
    {
      command: "select :item",
      callback: (item: string) => {
        const { products, onSelect } = actionsRef.current;
        const index = parseInt(item, 10);
        let product: Product | undefined;

        if (!isNaN(index) && index >= 1 && index <= products.length) {
          product = products[index - 1];
        } else {
          product = products.find((p) =>
            p.title.toLowerCase().includes(item.toLowerCase())
          );
        }

        if (product) {
          setLastCommand(`Selected: "${product.title}"`);
          onSelect(product);
        } else {
          setLastCommand(`Could not find: "${item}"`);
        }
      },
    },
    {
      command: "buy",
      callback: () => {
        const { products, onAddToCart } = actionsRef.current;
        if (products.length > 0) {
          setLastCommand(`Bought: "${products[0].title}"`);
          onAddToCart(products[0]);
        }
      },
    },
    {
      command: "clear",
      callback: () => {
        setLastCommand("Cleared search");
        actionsRef.current.onClear();
      },
    },
    {
      command: ["scroll down", "go down"],
      callback: () => {
        setLastCommand("Scrolling down");
        actionsRef.current.onScrollDown();
      },
    },
    {
      command: ["scroll up", "go up"],
      callback: () => {
        setLastCommand("Scrolling up");
        actionsRef.current.onScrollUp();
      },
    },
  ];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({ commands });

  const startListening = useCallback(() => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
  }, [resetTranscript]);

  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);

  return {
    isListening: listening,
    transcript,
    lastCommand,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
  };
}
