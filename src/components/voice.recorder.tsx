"use client";
import { useState, useRef, useEffect } from "react";
import { VoiceRecorderProps } from "../interface/components.interface";

const VoiceRecorder = ({ 
  onRecordingComplete, 
  expectedDuration = 5 
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showPlayback, setShowPlayback] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setShowPlayback(true);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Tidak dapat mengakses mikrofon. Pastikan Anda memberikan izin.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const submitRecording = () => {
    onRecordingComplete(recordingTime);
    setAudioBlob(null);
    setShowPlayback(false);
    setRecordingTime(0);
  };

  const retryRecording = () => {
    setAudioBlob(null);
    setShowPlayback(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDurationFeedback = () => {
    if (recordingTime === 0) return '';
    
    const ratio = recordingTime / expectedDuration;
    if (ratio >= 0.8 && ratio <= 1.2) {
      return '🎯 Durasi sempurna!';
    } else if (ratio < 0.8) {
      return '⚡ Terlalu cepat, coba lebih lambat';
    } else {
      return '🐌 Agak panjang, bisa lebih singkat';
    }
  };

  if (showPlayback) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <h3 className="font-bold mb-2">🎤 Rekaman Selesai!</h3>
          <p className="text-sm mb-2">Durasi: {formatTime(recordingTime)}</p>
          <p className="text-sm text-gray-600">{getDurationFeedback()}</p>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={playRecording}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition"
          >
            🔊 Dengar Ulang
          </button>
          <button
            onClick={retryRecording}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold transition"
          >
            🔄 Rekam Ulang
          </button>
          <button
            onClick={submitRecording}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition"
          >
            ✅ Lanjut
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <div className="text-6xl mb-2">
            {isRecording ? '🎤' : '🎙️'}
          </div>
          {isRecording && (
            <div className="flex justify-center items-center gap-1 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-500 font-bold">MEREKAM</span>
            </div>
          )}
        </div>

        {isRecording && (
          <div className="mb-4">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {formatTime(recordingTime)}
            </div>
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-8 bg-blue-400 rounded ${
                    isRecording ? 'animate-pulse' : ''
                  }`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: `${Math.random() * 20 + 20}px`
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-8 py-4 rounded-full font-bold text-lg transition transform hover:scale-105 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRecording ? '⏹️ Berhenti' : '🎤 Mulai Rekam'}
        </button>
      </div>

      {!isRecording && recordingTime === 0 && (
        <div className="text-sm text-gray-600">
          💡 Tekan tombol untuk mulai merekam suaramu
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;