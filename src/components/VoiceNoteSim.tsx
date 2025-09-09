"use client";
import { useState, useRef, useEffect } from "react";

interface VoiceNoteSimProps {
  text: string;
  isActive: boolean;
  allSentences?: string[];
  currentSentenceIdx?: number;
  currentWordIdx?: number;
  onWordProgress?: (sentenceIdx: number, wordIdx: number) => void;
}

export default function VoiceNoteSim({ 
  text, 
  isActive, 
  allSentences = [],
  currentSentenceIdx = 0,
  currentWordIdx = 0,
  onWordProgress
}: VoiceNoteSimProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.8);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const playFromCurrentPosition = () => {
    if ('speechSynthesis' in window && allSentences.length > 0) {
      window.speechSynthesis.cancel();
      
      let textToRead = "";
      
      const currentSentenceWords = allSentences[currentSentenceIdx]?.split(' ') || [];
      const remainingWordsInSentence = currentSentenceWords.slice(currentWordIdx);
      
      if (remainingWordsInSentence.length > 0) {
        textToRead += remainingWordsInSentence.join(' ');
      }
      
      for (let i = currentSentenceIdx + 1; i < allSentences.length; i++) {
        textToRead += '. ' + allSentences[i];
      }
      
      if (textToRead.trim()) {
        speechRef.current = new SpeechSynthesisUtterance(textToRead);
        speechRef.current.lang = 'id-ID';
        speechRef.current.rate = speechRate;
        speechRef.current.pitch = 1.1;
        
        speechRef.current.onstart = () => {
          setIsPlaying(true);
          startProgressTracking();
        };
        
        speechRef.current.onend = () => {
          setIsPlaying(false);
          stopProgressTracking();
        };
        
        speechRef.current.onerror = () => {
          setIsPlaying(false);
          stopProgressTracking();
        };
        
        window.speechSynthesis.speak(speechRef.current);
      }
    }
  };

  const startProgressTracking = () => {
    if (!onWordProgress) return;
    
    let sentenceIdx = currentSentenceIdx;
    let wordIdx = currentWordIdx;
    
    const baseInterval = 1000;
    const interval = baseInterval / speechRate;
    
    progressIntervalRef.current = setInterval(() => {
      const currentSentenceWords = allSentences[sentenceIdx]?.split(' ') || [];
      
      if (wordIdx < currentSentenceWords.length - 1) {
        wordIdx++;
      } else if (sentenceIdx < allSentences.length - 1) {
        sentenceIdx++;
        wordIdx = 0;
      } else {
        stopProgressTracking();
        return;
      }
      
      onWordProgress(sentenceIdx, wordIdx);
    }, interval);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const stopText = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      stopProgressTracking();
    }
  };

  const playCurrentWord = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      speechRef.current = new SpeechSynthesisUtterance(text);
      speechRef.current.lang = 'id-ID';
      speechRef.current.rate = speechRate;
      speechRef.current.pitch = 1.1;
      
      speechRef.current.onstart = () => setIsPlaying(true);
      speechRef.current.onend = () => setIsPlaying(false);
      speechRef.current.onerror = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(speechRef.current);
    }
  };

  if (!isActive) return null;

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg p-3 shadow">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">Kecepatan:</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs">{speechRate}x</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={playCurrentWord}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-bold transition"
          >
            🔊 Kata
          </button>
          
          <button
            onClick={isPlaying ? stopText : playFromCurrentPosition}
            className={`px-3 py-1 rounded text-sm font-bold transition ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isPlaying ? '⏹️ Stop' : '▶️ Lanjut Baca'}
          </button>
        </div>
      </div>
      
      {isPlaying && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      )}
    </div>
  );
}