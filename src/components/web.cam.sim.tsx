"use client";
import { useState, useEffect, useRef } from "react";
import { WebcamSimProps } from "../interface/components.interface";

const WebcamSim = ({ onFaceDetected, autoStart = false }: WebcamSimProps) => {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (autoStart) {
      startWebcam();
    }
    
    return () => {
      stopWebcam();
    };
  }, [autoStart]);

  useEffect(() => {
    if (!isActive) return;

    const faceDetectionInterval = setInterval(() => {
      const detected = Math.random() > 0.15;
      setFaceDetected(detected);
      
      if (onFaceDetected) {
        onFaceDetected(detected);
      }
    }, 3000);

    return () => clearInterval(faceDetectionInterval);
  }, [isActive, onFaceDetected]);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 320, 
          height: 240,
          facingMode: 'user' 
        } 
      });
      
      setStream(mediaStream);
      setIsActive(true);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Simulasi mode - webcam tidak tersedia');
      setIsActive(true);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setFaceDetected(true);
    setError(null);
  };

  if (!autoStart && !isActive) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <div className="bg-gray-100 rounded-lg shadow-lg p-3 border-2 border-gray-300">
          <div className="text-center">
            <div className="w-48 h-36 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <div className="text-4xl mb-2 opacity-50">📷</div>
                <p className="text-sm text-gray-500">Kamera Nonaktif</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Kamera hanya aktif saat membaca
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="z-40">
      <div className="bg-white rounded-lg shadow-lg p-3 border-2 border-gray-200">
        {!isActive ? (
          <div className="text-center">
            <div className="w-48 h-36 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
              <div className="text-center">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm text-gray-600">Kamera Mati</p>
              </div>
            </div>
            <button
              onClick={startWebcam}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-bold transition"
            >
              🔴 Nyalakan Kamera
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="relative w-full h-48 bg-gray-900 rounded-lg overflow-hidden mb-2">
              {stream && !error ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover scale-x-[-1]"
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center relative">
                  <div className="text-center text-white">
                    <div className="text-5xl mb-1 animate-bounce">🧑‍💻</div>
                    <p className="text-xs">Mode Simulasi</p>
                  </div>
                  <div className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
              )}
              
              <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                faceDetected 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white animate-pulse'
              }`}>
                {faceDetected ? '👁️ Fokus' : '⚠️ Tidak Fokus'}
              </div>
              
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {error && (
              <p className="text-xs text-orange-600 mb-2">{error}</p>
            )}

            <div className="flex gap-1 text-xs">
              <button
                onClick={startWebcam}
                className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-bold transition"
              >
                🔄 Restart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WebcamSim;