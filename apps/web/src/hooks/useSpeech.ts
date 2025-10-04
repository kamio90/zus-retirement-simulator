import { useState, useEffect, useCallback, useRef } from 'react';

export interface VoiceSettings {
  voiceName: string | null;
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
}

const DEFAULT_IT_VOICE: VoiceSettings = {
  voiceName: null,
  rate: 1.0,
  pitch: -0.5,
  volume: 1.0,
  lang: 'pl-PL',
};

const STORAGE_KEY = 'beaverVoice';

export function useSpeech(): {
  voices: SpeechSynthesisVoice[];
  settings: VoiceSettings;
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
  updateSettings: (newSettings: VoiceSettings) => void;
  speechSupported: boolean;
} {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_IT_VOICE);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load voices
  useEffect(() => {
    if (!speechSupported) return;

    const loadVoices = (): void => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return (): void => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [speechSupported]);

  // Load saved settings
  useEffect(() => {
    if (!speechSupported) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as VoiceSettings;
        setSettings(parsed);
      }
    } catch (error) {
      console.error('Error loading voice settings:', error);
    }
  }, [speechSupported]);

  // Save settings
  const saveSettings = useCallback((newSettings: VoiceSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving voice settings:', error);
    }
  }, []);

  // Get best matching voice
  const getVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    // Try exact match by name
    if (settings.voiceName) {
      const exactMatch = voices.find((v) => v.name === settings.voiceName);
      if (exactMatch) return exactMatch;
    }

    // Try language match
    const langMatch = voices.find((v) => v.lang.startsWith(settings.lang));
    if (langMatch) return langMatch;

    // Fallback to en-GB if pl-PL not available
    if (settings.lang === 'pl-PL') {
      const enMatch = voices.find((v) => v.lang.startsWith('en-GB'));
      if (enMatch) return enMatch;
    }

    // Last resort: first available voice
    return voices[0] || null;
  }, [voices, settings]);

  // Speak function
  const speak = useCallback(
    (text: string) => {
      if (!speechSupported) return;

      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getVoice();

      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = settings.lang;
      utterance.rate = settings.rate;
      utterance.pitch = 1.0 + settings.pitch / 10; // Convert -0.5 to pitch value
      utterance.volume = settings.volume;

      utterance.onstart = (): void => setIsSpeaking(true);
      utterance.onend = (): void => setIsSpeaking(false);
      utterance.onerror = (): void => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [speechSupported, settings, getVoice]
  );

  // Stop speaking
  const stop = useCallback(() => {
    if (speechSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [speechSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSupported && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechSupported]);

  return {
    voices,
    settings,
    isSpeaking,
    speak,
    stop,
    updateSettings: saveSettings,
    speechSupported,
  };
}
