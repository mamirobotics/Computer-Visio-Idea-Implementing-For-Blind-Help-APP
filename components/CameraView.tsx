import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { CameraHandle } from '../types';

interface CameraViewProps {
  isActive: boolean;
}

const CameraView = forwardRef<CameraHandle, CameraViewProps>(({ isActive }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const constraints = {
        audio: false,
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Camera access denied or not available.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      if (!videoRef.current || !canvasRef.current) return null;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Compress slightly for faster upload (0.7 quality)
      return canvas.toDataURL('image/jpeg', 0.7);
    }
  }));

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
      {error ? (
        <div className="text-white p-6 text-center">
          <p className="text-red-500 text-xl font-bold mb-2">Camera Error</p>
          <p>{error}</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Accessibility Overlay for aiming assistance (Visual crosshair) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
        <div className="w-16 h-16 border-2 border-white rounded-full"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  );
});

CameraView.displayName = "CameraView";
export default CameraView;
