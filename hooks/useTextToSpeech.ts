import { useState, useCallback, useEffect, useRef } from 'react';
import { Language } from '../types';
import { LANGUAGE_CONFIGS } from '../constants';

export const useTextToSpeech = (currentLanguage: Language) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = useRef<SpeechSynthesis>(window.speechSynthesis);

  const speak = useCallback((text: string) => {
    if (!text) return;

    // Cancel any current speech
    if (synth.current.speaking) {
      synth.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const config = LANGUAGE_CONFIGS[currentLanguage];
    
    utterance.lang = config.voiceLang;
    
    // Attempt to find a matching voice
    const voices = synth.current.getVoices();
    const matchingVoice = voices.find(v => v.lang.includes(config.voiceLang)) || 
                          voices.find(v => v.lang.includes(config.code));
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.current.speak(utterance);
  }, [currentLanguage]);

  const stop = useCallback(() => {
    if (synth.current.speaking) {
      synth.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Ensure voices are loaded (some browsers load async)
  useEffect(() => {
    const loadVoices = () => {
      synth.current.getVoices();
    };
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  return { speak, stop, isSpeaking };
};
