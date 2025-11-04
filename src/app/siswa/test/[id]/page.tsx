"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, Play, Pause, RotateCcw, Volume2, VolumeX, Camera, CameraOff } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const BacaPage = () => {
  const sessionFull = useSelector((state: RootState) => state.testSession.activeSession);
  const session = sessionFull?.data;
  const storyTitle = session?.titleAtTaken;
  const storyDesc = session?.descriptionAtTaken;
  const storyPassages: string[] =
    session?.passagesAtTaken && session.passagesAtTaken.length > 0 ? session.passagesAtTaken : (session?.passageAtTaken || session?.story?.passage || "").split("\n").filter((line: string) => line.trim() !== "");

  const allWords = storyPassages.flatMap((passage, passageIndex) =>
    passage.split(" ").map((word, wordIndex) => ({
      word,
      passageIndex,
      wordIndex,
    }))
  );

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(70);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [distractionScore, setDistractionScore] = useState(0);
  const [focusHistory, setFocusHistory] = useState<number[]>([]);
  const [eyeTrackingData, setEyeTrackingData] = useState({ x: 0, y: 0, looking: false });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastSpeakTimeRef = useRef<number>(0);
  const wordsRef = useRef<HTMLElement[]>([]);

  const initializeWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsWebcamActive(true);
        startEyeTracking();
      }
    } catch (err) {
      console.error("Webcam access denied:", err);
      alert("Tidak dapat mengakses webcam. Pastikan izin kamera diberikan.");
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const startEyeTracking = useCallback(() => {
    const detectFace = () => {
      if (!videoRef.current || !canvasRef.current || !isWebcamActive) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(detectFace);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let centerBrightness = 0;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const sampleSize = 50;
      let samples = 0;

      for (let y = centerY - sampleSize; y < centerY + sampleSize; y++) {
        for (let x = centerX - sampleSize; x < centerX + sampleSize; x++) {
          const i = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
          if (i >= 0 && i < data.length - 3) {
            centerBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
            samples++;
          }
        }
      }

      centerBrightness /= samples;
      const isFaceDetected = centerBrightness > 40 && centerBrightness < 200;

      const estimatedX = centerX + (Math.random() - 0.5) * 100;
      const estimatedY = centerY + (Math.random() - 0.5) * 100;

      setEyeTrackingData({
        x: estimatedX,
        y: estimatedY,
        looking: isFaceDetected,
      });

      if (isPlaying) {
        const currentWordElement = wordsRef.current[currentWordIndex];
        if (currentWordElement && isFaceDetected) {
          const rect = currentWordElement.getBoundingClientRect();
          const wordCenterX = rect.left + rect.width / 2;
          const wordCenterY = rect.top + rect.height / 2;

          const distance = Math.sqrt(Math.pow(estimatedX - wordCenterX, 2) + Math.pow(estimatedY - wordCenterY, 2));

          const isDistracted = distance > 300 || !isFaceDetected;
          setDistractionScore((prev) => {
            const newScore = isDistracted ? Math.min(prev + 1, 100) : Math.max(prev - 0.5, 0);
            setFocusHistory((h) => [...h.slice(-100), isFaceDetected && !isDistracted ? 1 : 0]);
            return newScore;
          });
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectFace);
    };

    detectFace();
  }, [isWebcamActive, isPlaying, currentWordIndex]);

  const speakWord = useCallback(
    (word: string) => {
      if (!isSpeechEnabled || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "id-ID";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSpeechEnabled]
  );

  useEffect(() => {
    if (!isPlaying || currentWordIndex >= allWords.length) {
      if (currentWordIndex >= allWords.length && isPlaying) {
        setIsPlaying(false);
      }
      return;
    }

    const msPerWord = (60 / readingSpeed) * 1000;
    const now = Date.now();

    if (now - lastSpeakTimeRef.current > msPerWord / 2) {
      speakWord(allWords[currentWordIndex].word);
      lastSpeakTimeRef.current = now;
    }

    const timer = setTimeout(() => {
      setCurrentWordIndex((prev) => prev + 1);
    }, msPerWord);

    return () => clearTimeout(timer);
  }, [isPlaying, currentWordIndex, readingSpeed, allWords, speakWord]);

  useEffect(() => {
    const currentElement = wordsRef.current[currentWordIndex];
    if (currentElement) {
      currentElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentWordIndex]);

  useEffect(() => {
    return () => {
      stopWebcam();
      window.speechSynthesis?.cancel();
    };
  }, [stopWebcam]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const resetReading = () => {
    setCurrentWordIndex(0);
    setIsPlaying(false);
    setDistractionScore(0);
    setFocusHistory([]);
    window.speechSynthesis?.cancel();
  };

  const focusPercentage = focusHistory.length > 0 ? Math.round((focusHistory.filter((f) => f === 1).length / focusHistory.length) * 100) : 100;

  return (
    <main className="min-h-screen bg-[#EDD1B0] p-4 verdana">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#F2E3D1] rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{storyTitle}</h1>
          {storyDesc && <p className="text-gray-600 text-sm">{storyDesc}</p>}
        </div>

        <div className="bg-[#F2E3D1] rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button onClick={togglePlay} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                {isPlaying ? "Jeda" : "Mulai"}
              </button>
              <button onClick={resetReading} className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors">
                <RotateCcw size={20} />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsSpeechEnabled((prev) => !prev)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${isSpeechEnabled ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-300 text-gray-700"}`}
              >
                {isSpeechEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button
                onClick={() => (isWebcamActive ? stopWebcam() : initializeWebcam())}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${isWebcamActive ? "bg-purple-500 hover:bg-purple-600 text-white" : "bg-gray-300 text-gray-700"}`}
              >
                {isWebcamActive ? <Camera size={20} /> : <CameraOff size={20} />}
              </button>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <label className="block mb-1 font-semibold text-gray-700">Kecepatan Membaca: {readingSpeed} WPM</label>
            <input type="range" min="50" max="200" step="5" value={readingSpeed} onChange={(e) => setReadingSpeed(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Lambat</span>
              <span>Sedang</span>
              <span>Cepat</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-[#F2E3D1] rounded-2xl shadow-lg p-8">
              <div className="space-y-4 text-lg leading-relaxed">
                {storyPassages.map((passage, pIdx) => (
                  <p key={pIdx} className="flex flex-wrap gap-1">
                    {passage.split(" ").map((word, wIdx) => {
                      const globalIndex = allWords.findIndex((w) => w.passageIndex === pIdx && w.wordIndex === wIdx);
                      const isCurrentWord = globalIndex === currentWordIndex;
                      const isPastWord = globalIndex < currentWordIndex;

                      return (
                        <span
                          key={wIdx}
                          ref={(el) => {
                            if (el) wordsRef.current[globalIndex] = el;
                          }}
                          className={`transition-all duration-200 px-1 py-0.5 rounded ${isCurrentWord ? "bg-yellow-300 font-bold scale-110 shadow-md" : isPastWord ? "text-gray-400" : "text-gray-800"}`}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#F2E3D1] rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4">Statistik Membaca</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">{Math.round((currentWordIndex / allWords.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(currentWordIndex / allWords.length) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Fokus</span>
                    <span className={`font-semibold ${focusPercentage >= 70 ? "text-green-600" : "text-red-600"}`}>{focusPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-300 ${focusPercentage >= 70 ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${focusPercentage}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Distraksi</span>
                    <span className={`font-semibold ${distractionScore < 30 ? "text-green-600" : "text-red-600"}`}>{Math.round(distractionScore)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-300 ${distractionScore < 30 ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${distractionScore}%` }} />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <Eye size={16} className="text-gray-600" />
                    <span className="text-gray-600">Status Mata:</span>
                    <span className={`font-semibold ${eyeTrackingData.looking ? "text-green-600" : "text-red-600"}`}>{eyeTrackingData.looking ? "Fokus" : "Teralihkan"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F2E3D1] rounded-2xl shadow-lg p-4">
              <div className="relative">
                <video ref={videoRef} className="w-full rounded-lg" playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                {eyeTrackingData.looking && <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">Terdeteksi</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BacaPage;
