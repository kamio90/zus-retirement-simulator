/**
 * BeaverCoach Component - Friendly assistant with speech bubble
 * Provides contextual help and guidance throughout the wizard
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export interface BeaverCoachProps {
  message: string;
  tone?: 'info' | 'tip' | 'warning';
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

export function BeaverCoach({
  message,
  tone = 'info',
  ctaLabel,
  onCta,
}: BeaverCoachProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

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
  }, [message]);

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
    <div className="beaver-coach-container fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50 max-w-sm md:max-w-md">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div {...animations} className="flex items-start gap-3">
            {/* Beaver Image */}
            <div className="flex-shrink-0">
              <img
                src="/beaver.png"
                alt="Beaver Coach - twój przewodnik emerytalny"
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
              />
            </div>

            {/* Speech Bubble */}
            <div
              className={`relative flex-1 p-4 rounded-lg border-2 shadow-lg ${toneStyles[tone]}`}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {/* Triangle pointer */}
              <div
                className={`absolute left-0 top-6 transform -translate-x-2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent ${
                  tone === 'info'
                    ? 'border-r-blue-200'
                    : tone === 'tip'
                      ? 'border-r-green-200'
                      : 'border-r-yellow-200'
                }`}
              />

              <div className="flex items-start gap-2">
                <span className="text-xl flex-shrink-0" role="img" aria-label={tone}>
                  {toneIcons[tone]}
                </span>
                <div className="flex-1">
                  <p className="text-sm md:text-base leading-relaxed">{message}</p>

                  {ctaLabel && onCta && (
                    <button
                      onClick={onCta}
                      className="mt-3 text-sm font-semibold underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zus-primary rounded"
                    >
                      {ctaLabel}
                    </button>
                  )}
                </div>
              </div>

              {/* Hint for keyboard shortcut */}
              <p className="mt-2 text-xs opacity-60">
                Naciśnij <kbd className="px-1 py-0.5 bg-white bg-opacity-50 rounded">?</kbd> aby
                ponownie usłyszeć podpowiedź
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
