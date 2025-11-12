"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Eye, Play, Pause, RotateCcw, Volume2, VolumeX, Camera, CameraOff, Loader } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import TestSessionServices from "@/services/test-session.services";
import { useDispatch } from "react-redux";
import { showToastError } from "@/components/utils/toast.utils";
import type { CalibrationData } from "@/lib/eye-tracking/gazeCalibration";
import { useFocusDetection, FocusStatus, type DebugInfo } from "@/hooks/eye-tracking/useFocusDetection";

const BacaPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isQuestionLoading, setQuestionLoading] = useState(false);
  const sessionFull = useSelector((state: RootState) => state.testSession.activeSession);

  const storyId = sessionFull?.data.story.id;
  const sessionId = sessionFull?.data.id;
  const session = sessionFull?.data;
  const storyTitle = session?.titleAtTaken;
  const storyDesc = session?.descriptionAtTaken;
  const storyPassages: string[] =
    session?.passagesAtTaken && session.passagesAtTaken.length > 0 ? session.passagesAtTaken : (session?.passageAtTaken || session?.story?.passage || "").split("\n").filter((line: string) => line.trim() !== "");

  // PERFORMANCE: Memoize expensive allWords calculation
  const allWords = useMemo(() => 
    storyPassages.flatMap((passage, passageIndex) =>
      passage.split(" ").map((word, wordIndex) => ({
        word,
        passageIndex,
        wordIndex,
      }))
    ), [storyPassages]);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(70);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [distractionScore, setDistractionScore] = useState(0);
  const [focusHistory, setFocusHistory] = useState<number[]>([]);
  const [totalDistractions, setTotalDistractions] = useState(0);
  const [calibrationResult, setCalibrationResult] = useState<CalibrationData | null>(null);
  const [eyeTrackingData, setEyeTrackingData] = useState({ x: 0, y: 0, looking: false });

  const readingAreaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpeakTimeRef = useRef<number>(0);
  const wordsRef = useRef<HTMLElement[]>([]);

  const handleDistraction = useCallback((status: FocusStatus) => {
    setTotalDistractions(prev => prev + 1);
    setDistractionScore(prev => Math.min(prev + 10, 100));
    
    const message = status === FocusStatus.turning ? 'Anda menoleh!' : 'Mata keluar dari area bacaan!';
    console.log('Distraction detected:', message);
    
    setFocusHistory(prev => [...prev.slice(-99), 0]);
  }, []);

  const handleCalibrationComplete = useCallback((calibration: CalibrationData) => {
    setCalibrationResult(calibration);
    console.log('Calibration completed:', calibration);
  }, []);

  const { 
    status: eyeTrackingStatus, 
    debug, 
    startCalibration, 
    calibrationCountdown, 
    isCalibrating 
  } = useFocusDetection({
    videoElementRef: videoRef as React.RefObject<HTMLVideoElement>,
    canvasElementRef: canvasRef as React.RefObject<HTMLCanvasElement>,
    onDistraction: handleDistraction,
    onCalibrationComplete: handleCalibrationComplete,
    config: {
      yawThresholdDeg: 15, // Reduced for better sensitivity
      pitchThresholdDeg: 12, // Reduced for better sensitivity
      enableOpenCV: false, // DISABLED for maximum performance
      autoLoadCalibration: true,
      minValidGazeSamples: 2, // Reduced for faster processing
      poseSmoothWindow: 3, // Minimal smoothing
      gazeSmoothWindow: 2, // Minimal smoothing
    },
  });

  const initializeWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsWebcamActive(true);
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
  }, []);

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

  // PERFORMANCE OPTIMIZATION: Use interval instead of useEffect for focus tracking
  useEffect(() => {
    if (!isWebcamActive || !isPlaying) {
      return;
    }

    // Update focus history and distraction score every 500ms instead of every frame
    const focusUpdateInterval = setInterval(() => {
      const isFocused = eyeTrackingStatus === FocusStatus.focus;
      
      setFocusHistory(prev => {
        const newHistory = [...prev.slice(-99), isFocused ? 1 : 0];
        return newHistory;
      });
      
      if (!isFocused) {
        setDistractionScore(prev => Math.max(prev - 0.5, 0));
      }
    }, 500); // Only update twice per second

    return () => clearInterval(focusUpdateInterval);
  }, [isWebcamActive, isPlaying]); // Removed eyeTrackingStatus dependency

  // Separate effect for immediate distraction response (not frequent updates)
  useEffect(() => {
    if (isWebcamActive && isPlaying && eyeTrackingStatus !== FocusStatus.focus) {
      // Immediate response for distraction without frequent state updates
    }
  }, [eyeTrackingStatus, isWebcamActive, isPlaying]);

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

  const handleNextQuestion = async () => {
    setQuestionLoading(true);

    if (!sessionId || !storyId) {
      showToastError("SessionId atau StoryId tidak ditemukan.");
      setQuestionLoading(false);
      return;
    }

    const response = await TestSessionServices.StartQuestion(dispatch, sessionId, storyId);
    setQuestionLoading(false);

    if (response.success) {
      router.push("/siswa/test/stt/" + session?.id + "/1");
    }

    return;
  };

  const focusPercentage = focusHistory.length > 0 ? Math.round((focusHistory.filter((f) => f === 1).length / focusHistory.length) * 100) : 100;
  const progress = (currentWordIndex + 1) / allWords.length;
  const isFinished = progress >= 1;

  if (isQuestionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F2E3D1] to-[#EDD1B0]">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#DE954F] mx-auto mb-4" />
          <p className="text-[#3b2a1a]/80">Memuat pertanyaan...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#EDD1B0] p-4 verdana">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#Fff8ec] border border-[#DE954F] rounded-xl shadow-md p-6 my-6">
          <h1 className="text-3xl font-bold text-[#5a4631] mb-2">{storyTitle}</h1>
          {storyDesc && <p className="text-[#5a4631] text-sm">{storyDesc}</p>}
        </div>

        <div className="bg-[#Fff8ec] border border-[#DE954F] rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button onClick={togglePlay} className="flex items-center gap-2 bg-[#DE954F] hover:[#DE954F]/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                {isPlaying ? "Jeda" : "Mulai"}
              </button>
              <button onClick={resetReading} className="flex items-center gap-2 bg-[#EDD1B0] hover:bg-[#DE954F] hover:text-white text-[#3b2a1a] px-4 py-3 rounded-lg transition-colors">
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
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors ${isWebcamActive ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-300 text-gray-700"}`}
              >
                {isWebcamActive ? <Camera size={20} /> : <CameraOff size={20} />}
              </button>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#DE954F]/50">
            <label className="block mb-1 font-semibold text-[#5a4631]">Kecepatan Membaca: {readingSpeed} WPM</label>
            <input type="range" min="50" max="200" step="5" value={readingSpeed} onChange={(e) => setReadingSpeed(Number(e.target.value))} className="w-full h-2 bg-[#DE954F]/60 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-xs text-[#5a4631]/80 mt-1">
              <span>Lambat</span>
              <span>Sedang</span>
              <span>Cepat</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-[#Fff8ec] border border-[#DE954F] rounded-xl shadow-md p-8">
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
                          className={`transition-all duration-200 px-1.5 py-0.5 rounded ${isCurrentWord ? "bg-[#DE954F] text-white font-bold scale-100 shadow-md" : isPastWord ? "text-[#5a4631]/30" : "text-[#5a4631]"}`}
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
            <div className="bg-[#Fff8ec] border border-[#DE954F] rounded-xl shadow-md p-6">
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
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Eye size={16} className="text-gray-600" />
                    <span className="text-gray-600">Status Eye Tracking:</span>
                    <span className={`font-semibold uppercase ${
                      eyeTrackingStatus === FocusStatus.focus ? "text-green-600" : 
                      eyeTrackingStatus === FocusStatus.not_detected ? "text-gray-600" : 
                      "text-red-600"
                    }`}>
                      {eyeTrackingStatus}
                    </span>
                  </div>
                  
                  {isWebcamActive && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Total Distraksi:</span>
                      <span className="font-semibold text-red-600">{totalDistractions}</span>
                    </div>
                  )}
                  
                  {debug?.headPose && (
                    <div className="text-xs text-gray-500 mt-1">
                      Yaw: {debug.headPose.yaw.toFixed(1)}° | Pitch: {debug.headPose.pitch.toFixed(1)}°
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#Fff8ec] border border-[#DE954F] rounded-xl shadow-md p-4">
              <div className="relative">
                <video ref={videoRef} className="w-full rounded-lg transform scale-x-[-1]" playsInline muted />
                {/* Mirror canvas too so drawn points align with mirrored video */}
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none transform scale-x-[-1]" />
                
                {isWebcamActive && (
                  <>
                    <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      eyeTrackingStatus === FocusStatus.focus ? "bg-green-500 text-white" : 
                      eyeTrackingStatus === FocusStatus.not_detected ? "bg-gray-500 text-white" : 
                      "bg-red-500 text-white"
                    }`}>
                      {eyeTrackingStatus.toUpperCase()}
                    </div>
                    
                    <button
                      onClick={startCalibration}
                      disabled={isCalibrating}
                      className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        isCalibrating ? "bg-orange-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      {isCalibrating ? `Kalibrasi ${calibrationCountdown}s` : "📐 Kalibrasi"}
                    </button>
                    
                    {calibrationResult && (
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                        ✓ Kalibrasi OK
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {!isWebcamActive && (
                <div className="text-center text-gray-500 text-sm mt-2">
                  Aktifkan kamera untuk memulai eye tracking
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className={`mt-6 w-[100%] border border-[#DE954F] rounded-xl shadow-md p-4 flex justify-center ${
            isFinished ? "bg-[#DE954F] text-white shadow-md hover:bg-[#C98342] hover:shadow-lg active:scale-95" : "bg-[#DE954F]/60 text-white cursor-not-allowed opacity-60"
          }`}
        >
          <button onClick={handleNextQuestion} disabled={!isFinished} className={`w-full sm:w-auto px-3 py-2 rounded-xl font-bold text-xl transition-all duration-300`}>
            {isFinished ? "Lanjut ke Sesi Pertanyaan" : "Selesaikan Membaca Dulu Yaa"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default BacaPage;
