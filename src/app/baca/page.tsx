"use client";
import { useState, useEffect, useRef } from "react";
import WebcamSim from "@/components/WebcamSim";
import TextHighlight from "@/components/TextHighlight";
import VoiceNoteSim from "@/components/VoiceNoteSim";
import Link from "next/link";
import { useColors } from "@/hooks/use.colors";
import { storyData } from "@/data/story.data";

const BacaPage = () => {
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(1000);
  const [isFinished, setIsFinished] = useState(false);
  const [showDistraction, setShowDistraction] = useState(false);
  const [readingStats, setReadingStats] = useState({
    startTime: Date.now(),
    distractionCount: 0,
    wordsRead: 0
  });
  
  const colors = useColors();
  const autoPlayInterval = useRef<NodeJS.Timeout | null>(null);
  const distractionTimer = useRef<NodeJS.Timeout | null>(null);

  const allWords = storyData.sentences.join(' ').split(' ');
  const currentSentenceWords = storyData.sentences[currentSentenceIdx]?.split(' ') || [];

  useEffect(() => {
    if (isAutoPlaying && !isFinished) {
      autoPlayInterval.current = setTimeout(() => {
        if (currentWordIdx < currentSentenceWords.length - 1) {
          setCurrentWordIdx(prev => prev + 1);
          setReadingStats(prev => ({ ...prev, wordsRead: prev.wordsRead + 1 }));
        } else if (currentSentenceIdx < storyData.sentences.length - 1) {
          setCurrentSentenceIdx(prev => prev + 1);
          setCurrentWordIdx(0);
          setReadingStats(prev => ({ ...prev, wordsRead: prev.wordsRead + 1 }));
        } else {
          setIsFinished(true);
          setIsAutoPlaying(false);
        }
      }, autoPlaySpeed);
    }

    return () => {
      if (autoPlayInterval.current) {
        clearTimeout(autoPlayInterval.current);
      }
    };
  }, [isAutoPlaying, currentSentenceIdx, currentWordIdx, currentSentenceWords.length, isFinished, autoPlaySpeed]);

  useEffect(() => {
    if (distractionTimer.current) {
      clearTimeout(distractionTimer.current);
    }

    distractionTimer.current = setTimeout(() => {
      if (!isFinished && !showDistraction) {
        setShowDistraction(true);
        setIsAutoPlaying(false);
        setReadingStats(prev => ({ 
          ...prev, 
          distractionCount: prev.distractionCount + 1 
        }));
      }
    }, 15000);

    return () => {
      if (distractionTimer.current) {
        clearTimeout(distractionTimer.current);
      }
    };
  }, [currentSentenceIdx, currentWordIdx, isFinished, showDistraction]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setShowDistraction(true);
        setIsAutoPlaying(false);
        setReadingStats(prev => ({ 
          ...prev, 
          distractionCount: prev.distractionCount + 1 
        }));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleFaceDetection = (detected: boolean) => {
    if (!detected && !showDistraction) {
      setShowDistraction(true);
      setIsAutoPlaying(false);
      setReadingStats(prev => ({ 
        ...prev, 
        distractionCount: prev.distractionCount + 1 
      }));
    }
  };

  const handleVoiceProgress = (sentenceIdx: number, wordIdx: number) => {
    setCurrentSentenceIdx(sentenceIdx);
    setCurrentWordIdx(wordIdx);
  };

  const handleWordClick = (sentenceIdx: number, wordIdx: number) => {
    setCurrentSentenceIdx(sentenceIdx);
    setCurrentWordIdx(wordIdx);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const continueReading = () => {
    setShowDistraction(false);
  };

  const calculateProgress = () => {
    const totalWords = allWords.length;
    const wordsReadSoFar = storyData.sentences
      .slice(0, currentSentenceIdx)
      .join(' ')
      .split(' ').length + currentWordIdx;
    return Math.min((wordsReadSoFar / totalWords) * 100, 100);
  };

  const calculateMedal = () => {
    const { distractionCount } = readingStats;
    if (distractionCount === 0) return 'gold';
    if (distractionCount <= 2) return 'silver';
    return 'bronze';
  };

  const getCurrentWord = () => {
    return currentSentenceWords[currentWordIdx] || '';
  };

  const getSpeedLabel = () => {
    if (autoPlaySpeed <= 500) return 'Sangat Cepat';
    if (autoPlaySpeed <= 800) return 'Cepat';
    if (autoPlaySpeed <= 1200) return 'Sedang';
    if (autoPlaySpeed <= 1800) return 'Lambat';
    return 'Sangat Lambat';
  };

  return (
    <main className="min-h-screen p-4" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primaryText }}>
          {storyData.title}
        </h1>
        <p className="text-lg" style={{ color: colors.secondaryText }}>
          {storyData.description}
        </p>
        
        {/* Progress Bar */}
        <div className="mt-4 bg-gray-200 rounded-full h-3 max-w-md mx-auto">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <p className="text-sm mt-2" style={{ color: colors.secondaryText }}>
          Kata: <strong>{getCurrentWord()}</strong> | Progress: {Math.round(calculateProgress())}%
        </p>
      </div>

      <WebcamSim onFaceDetected={handleFaceDetection} autoStart={true} />

      {/* Story Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="space-y-6">
            {storyData.sentences.map((sentence, sentenceIdx) => (
              <TextHighlight
                key={sentenceIdx}
                text={sentence}
                currentWordIndex={sentenceIdx === currentSentenceIdx ? currentWordIdx : -1}
                isRead={sentenceIdx < currentSentenceIdx}
                onWordClick={(wordIdx) => handleWordClick(sentenceIdx, wordIdx)}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Speed Control */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-center gap-4">
              <span className="font-bold" style={{ color: colors.primaryText }}>
                Kecepatan Highlight:
              </span>
              <input
                type="range"
                min="300"
                max="2000"
                step="100"
                value={autoPlaySpeed}
                onChange={(e) => setAutoPlaySpeed(parseInt(e.target.value))}
                className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-bold" style={{ color: colors.accent }}>
                {getSpeedLabel()}
              </span>
            </div>
          </div>

          {/* Play Controls & Voice */}
          <div className="flex justify-center gap-4">
            <button
              onClick={toggleAutoPlay}
              disabled={isFinished}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                isAutoPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } ${isFinished ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isAutoPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>

            <VoiceNoteSim 
              text={getCurrentWord()}
              isActive={true}
              allSentences={storyData.sentences}
              currentSentenceIdx={currentSentenceIdx}
              currentWordIdx={currentWordIdx}
              onWordProgress={handleVoiceProgress}
            />
          </div>
        </div>

        {/* Reading Stats */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="font-bold mb-2" style={{ color: colors.primaryText }}>
            Statistik Membaca:
          </h3>
          <div className="flex gap-6 text-sm" style={{ color: colors.secondaryText }}>
            <span>📖 Progress: {Math.round(calculateProgress())}%</span>
            <span>⚡ Distraksi: {readingStats.distractionCount}</span>
            <span>🏅 Medal: {calculateMedal() === 'gold' ? '🥇' : calculateMedal() === 'silver' ? '🥈' : '🥉'}</span>
            <span>📝 Kata Saat Ini: <strong>{getCurrentWord()}</strong></span>
          </div>
        </div>

        {/* Finish Button */}
        {isFinished && (
          <div className="text-center">
            <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 mb-4">
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                🎉 Selamat! Kamu telah selesai membaca!
              </h2>
              <p className="text-green-700">
                Medal yang kamu dapatkan: {calculateMedal() === 'gold' ? '🥇 Emas' : calculateMedal() === 'silver' ? '🥈 Perak' : '🥉 Perunggu'}
              </p>
            </div>
            
            <Link href={`/pertanyaan?story=${encodeURIComponent(storyData.title)}&medal=${calculateMedal()}`}>
              <button className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-lg transition">
                📝 Lanjut ke Pertanyaan
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Distraction Alert dengan Tombol Lanjutkan */}
      {showDistraction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-6 text-center max-w-md mx-4">
            <div className="text-4xl mb-2">⚠️</div>
            <h3 className="text-xl font-bold text-red-800 mb-2">
              Kamu Terdistraksi!
            </h3>
            <p className="text-red-700 mb-4">
              Ayo fokus kembali ke cerita ya! 📖
            </p>
            <button
              onClick={continueReading}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition"
            >
              ✅ Lanjutkan Membaca
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default BacaPage;