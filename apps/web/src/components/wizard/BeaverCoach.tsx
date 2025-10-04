/**
 * BeaverCoach Component - Friendly assistant with speech bubble
 * Version 2.0: Multiple poses, TTS speech, and transcript support
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export type BeaverPose =
  | 'idle'
  | 'wave'
  | 'point-left'
  | 'point-right'
  | 'think'
  | 'read'
  | 'typing'
  | 'idea'
  | 'warning'
  | 'info-card'
  | 'celebrate';

export interface BeaverCoachProps {
  message: string;
  tone?: 'info' | 'tip' | 'warning';
  pose?: BeaverPose;
  ctaLabel?: string;
  onCta?: () => void;
}

const toneStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  tip: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
};

const toneIcons = {
  info: 'ℹ️',
  tip: '💡',
  warning: '⚠️',
};

// Map poses to emoji representations (until we have actual assets)
const poseEmojis: Record<BeaverPose, string> = {
  idle: '🦫',
  wave: '👋🦫',
  'point-left': '👈🦫',
  'point-right': '🦫👉',
  think: '🤔🦫',
  read: '📖🦫',
  typing: '⌨️🦫',
  idea: '💡🦫',
  warning: '⚠️🦫',
  'info-card': '🧠🦫',
  celebrate: '🎉🦫',
};

export function BeaverCoach({
  message,
  tone = 'info',
  pose = 'idle',
  ctaLabel,
  onCta,
}: BeaverCoachProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check for Web Speech API support
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent): void => {
      setShouldReduceMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    setIsVisible(true);
    // Cancel any ongoing speech when message changes
    if (speechSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [message, speechSupported]);

  // Speak the message using Web Speech API
  const speak = (): void => {
    if (!speechSupported) return;

    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'pl-PL';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onstart = (): void => setIsSpeaking(true);
    utterance.onend = (): void => setIsSpeaking(false);
    utterance.onerror = (): void => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (speechSupported && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechSupported]);

  // Keyboard shortcut to re-read helper
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (e.key === '?' && !e.shiftKey) {
        setIsVisible(false);
        setTimeout(() => setIsVisible(true), 100);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const animations = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.3 },
      };

  return (
    <div className="beaver-coach-container fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50 max-w-md md:max-w-lg">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div {...animations} className="flex items-start gap-4">
            {/* Beaver Image - Larger size with pose */}
            <div className="flex-shrink-0">
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                {/* Using emoji representation until assets are added */}
                <div className="w-28 h-28 md:w-36 md:h-36 flex items-center justify-center text-6xl md:text-7xl">
                  {poseEmojis[pose]}
                </div>
              </motion.div>
            </div>

            {/* Speech Bubble */}
            <div
              className={`relative flex-1 p-5 rounded-lg border-2 shadow-lg ${toneStyles[tone]}`}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {/* Triangle pointer */}
              <div
                className={`absolute left-0 top-8 transform -translate-x-2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent ${
                  tone === 'info'
                    ? 'border-r-blue-200'
                    : tone === 'tip'
                      ? 'border-r-green-200'
                      : 'border-r-yellow-200'
                }`}
              />

              {/* Icon and Title Row */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl" role="img" aria-label={`Ton: ${tone}`}>
                  {toneIcons[tone]}
                </span>
                <span className="text-sm font-bold">Beaver Coach</span>

                {/* TTS Controls */}
                {speechSupported && (
                  <button
                    onClick={speak}
                    className="ml-auto px-2 py-1 text-xs font-medium rounded transition-colors hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-zus-primary"
                    aria-label={isSpeaking ? 'Zatrzymaj czytanie' : 'Odczytaj wiadomość'}
                  >
                    {isSpeaking ? '🔊 Zatrzymaj' : '🔇 Odczytaj'}
                  </button>
                )}
              </div>

              {/* Message - Show/hide based on transcript toggle */}
              {showTranscript && <p className="text-base leading-relaxed mb-3">{message}</p>}

              {/* Transcript Toggle */}
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-xs font-medium underline hover:no-underline transition-all focus:outline-none focus:ring-2 focus:ring-zus-primary rounded"
              >
                {showTranscript ? '▼ Ukryj transkrypcję' : '▶ Pokaż transkrypcję'}
              </button>

              {/* Optional CTA */}
              {ctaLabel && onCta && (
                <button
                  onClick={onCta}
                  className="mt-4 w-full px-4 py-2 bg-zus-primary text-white font-semibold rounded-md hover:bg-zus-accent transition-colors focus:outline-none focus:ring-2 focus:ring-zus-primary"
                >
                  {ctaLabel}
                </button>
              )}

              {/* Keyboard hint */}
              <p className="text-xs opacity-60 mt-3">
                Naciśnij <kbd className="px-1 py-0.5 bg-white bg-opacity-50 rounded">?</kbd> aby
                ponownie wyświetlić
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
