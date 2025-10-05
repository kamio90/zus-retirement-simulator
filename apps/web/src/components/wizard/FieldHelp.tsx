/**
 * FieldHelp - Context help popover for form fields
 * Shows Beaver explanation with TTS support
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeech } from '../../hooks/useSpeech';

interface FieldHelpProps {
  fieldId: string;
  explanation: string;
  example?: string;
  beaverPose?: string;
  className?: string;
}

export function FieldHelp({
  fieldId,
  explanation,
  example,
  beaverPose = '🦫💡',
  className = '',
}: FieldHelpProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { speak, stop, speechSupported, isSpeaking } = useSpeech();

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Stop TTS when closing
  useEffect(() => {
    if (!isOpen && isSpeaking) {
      stop();
    }
  }, [isOpen, isSpeaking, stop]);

  const handleToggle = (): void => {
    setIsOpen(!isOpen);
  };

  const handleSpeakToggle = (): void => {
    if (isSpeaking) {
      stop();
    } else {
      speak(explanation);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-zus-primary transition-colors rounded-full hover:bg-gray-100"
        aria-label={`Wyjaśnij pole: ${fieldId}`}
        aria-expanded={isOpen}
        aria-controls={`fieldhelp-${fieldId}`}
      >
        ℹ️
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            id={`fieldhelp-${fieldId}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-80 bg-white rounded-lg shadow-xl border-2 border-zus-primary p-4 mt-2"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            role="dialog"
            aria-labelledby={`fieldhelp-title-${fieldId}`}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 w-6 h-6 text-gray-400 hover:text-gray-600"
              aria-label="Zamknij"
            >
              ✕
            </button>

            {/* Beaver pose */}
            <div className="text-3xl mb-2" aria-hidden="true">
              {beaverPose}
            </div>

            {/* Title */}
            <h3 id={`fieldhelp-title-${fieldId}`} className="text-sm font-bold text-gray-900 mb-2">
              Co to pole zmienia?
            </h3>

            {/* Explanation */}
            <p className="text-sm text-gray-700 mb-3">{explanation}</p>

            {/* Example */}
            {example && (
              <div className="bg-zus-secondary rounded-md p-2 mb-3">
                <p className="text-xs text-gray-600">
                  <strong>Przykład:</strong> {example}
                </p>
              </div>
            )}

            {/* TTS controls */}
            {speechSupported && (
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={handleSpeakToggle}
                  className="px-3 py-1 bg-zus-primary text-white rounded text-xs hover:bg-zus-accent transition-colors"
                  aria-label={isSpeaking ? 'Zatrzymaj czytanie' : 'Odtwórz głosowo'}
                >
                  {isSpeaking ? '⏸ Zatrzymaj' : '▶ Odtwórz'}
                </button>
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-xs text-zus-primary hover:underline"
                  aria-expanded={showTranscript}
                >
                  {showTranscript ? '▼ Ukryj transkrypcję' : '▶ Pokaż transkrypcję'}
                </button>
              </div>
            )}

            {/* Transcript */}
            {showTranscript && (
              <div className="bg-gray-50 rounded-md p-2 text-xs text-gray-600">
                {explanation}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
