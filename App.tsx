import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language, CameraHandle } from './types';
import { AUTO_CAPTURE_INTERVAL_MS } from './constants';
import CameraView from './components/CameraView';
import LanguageSelector from './components/LanguageSelector';
import { describeImage } from './services/geminiService';
import { useTextToSpeech } from './hooks/useTextToSpeech';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastDescription, setLastDescription] = useState<string>("Welcome. Tap the screen to start.");
  const [autoMode, setAutoMode] = useState(false);
  
  const cameraRef = useRef<CameraHandle>(null);
  const { speak, stop, isSpeaking } = useTextToSpeech(language);
  const processingRef = useRef(false); // Ref for interval access without dependency loop

  // Update ref when state changes
  useEffect(() => {
    processingRef.current = isProcessing;
  }, [isProcessing]);

  const handleVibrate = (pattern: number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const processImage = useCallback(async () => {
    if (processingRef.current) return;
    
    const imageBase64 = cameraRef.current?.captureFrame();
    if (!imageBase64) return;

    try {
      setIsProcessing(true);
      handleVibrate([50]); // Short blip for "started processing"
      
      const description = await describeImage(imageBase64, language);
      
      setLastDescription(description);
      speak(description);
      handleVibrate([50, 50, 50]); // Success double blip
    } catch (error) {
      console.error(error);
      const errText = "Sorry, I had trouble seeing that.";
      speak(errText);
      handleVibrate([200, 100, 200]); // Error long vibration
    } finally {
      setIsProcessing(false);
    }
  }, [language, speak]);

  // Auto Mode Effect
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    if (autoMode) {
      // Announce mode change
      speak(`Auto mode enabled. Detecting every ${AUTO_CAPTURE_INTERVAL_MS / 1000} seconds.`);
      
      intervalId = setInterval(() => {
        if (!processingRef.current && !isSpeaking) {
            processImage();
        }
      }, AUTO_CAPTURE_INTERVAL_MS);
    } else {
      // Only announce if we were previously in auto mode (avoid initial mount announce)
      if (intervalId!) { // Simplistic check, ideally use a previous state hook
         stop();
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoMode, processImage, isSpeaking, speak, stop]);

  const toggleAutoMode = () => {
    const newMode = !autoMode;
    setAutoMode(newMode);
    handleVibrate([100]);
    if (!newMode) speak("Manual mode.");
  };

  const handleManualCapture = () => {
    if (autoMode) {
        // If tapping in auto mode, maybe reiterate last description or stop auto?
        // Let's keep it simple: tapping forces a read now if not processing
        if (!isProcessing) processImage();
    } else {
        stop(); // Stop current speech if any
        processImage();
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-black text-white">
      {/* Header / Settings */}
      <header className="shrink-0 z-10">
        <LanguageSelector 
          currentLanguage={language} 
          onLanguageChange={(lang) => {
            setLanguage(lang);
            handleVibrate([50]);
            // Announce language change in that language
            // The useTextToSpeech hook will pick up the new language state for the next speak call,
            // but we need to force a speak now with the NEW language.
            // Since state updates are async, we might need a small timeout or a direct synthesis call, 
            // but for simplicity, the user will hear the next description in the new language.
          }} 
          disabled={isProcessing}
        />
      </header>

      {/* Main Camera Area - Clickable/Tappable for Blind Users */}
      <main 
        className="flex-grow relative cursor-pointer group" 
        onClick={handleManualCapture}
        role="button"
        aria-label="Camera View. Double tap to describe scene."
      >
        <CameraView ref={cameraRef} isActive={true} />

        {/* Loading Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 backdrop-blur-sm">
            <div className="w-24 h-24 rounded-full border-8 border-t-yellow-400 border-white/30 animate-spin"></div>
          </div>
        )}

        {/* Text Overlay (Subtitles for low vision) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pb-8 pointer-events-none">
          <p className="text-2xl md:text-3xl font-bold text-yellow-300 drop-shadow-md leading-relaxed min-h-[4rem]">
             {isProcessing ? "Analyzing..." : lastDescription}
          </p>
        </div>
      </main>

      {/* Bottom Controls - Big Buttons */}
      <footer className="shrink-0 grid grid-cols-2 gap-2 p-2 bg-gray-900 h-32">
        <button
          onClick={handleManualCapture}
          disabled={isProcessing}
          className={`
            rounded-xl text-2xl font-bold uppercase tracking-wider shadow-lg flex flex-col items-center justify-center
            active:scale-95 transition-all
            ${isProcessing ? 'bg-gray-700 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-500'}
          `}
          aria-label="Describe Scene Now"
        >
          <span className="text-4xl mb-2">👁️</span>
          Describe
        </button>

        <button
          onClick={toggleAutoMode}
          className={`
            rounded-xl text-xl font-bold uppercase tracking-wider shadow-lg flex flex-col items-center justify-center
            active:scale-95 transition-all border-4
            ${autoMode 
              ? 'bg-red-600 border-red-800 text-white animate-pulse' 
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}
          `}
          aria-label={autoMode ? "Stop Auto Description" : "Start Auto Description"}
          aria-pressed={autoMode}
        >
          <span className="text-4xl mb-2">{autoMode ? '🛑' : '🔄'}</span>
          {autoMode ? 'Stop Auto' : 'Auto Mode'}
        </button>
      </footer>
    </div>
  );
};

export default App;