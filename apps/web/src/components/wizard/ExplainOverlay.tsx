/**
 * ExplainOverlay Component - "Explain This" contextual micro-lessons
 * Shows spotlight on target element with Beaver-narrated explainer
 */
import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExplainOverlayStore } from '../../stores/explainOverlayStore';
import { useSpeech } from '../../hooks/useSpeech';

// Check for reduced motion preference
const shouldReduceMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ExplainOverlay(): JSX.Element {
  const {
    isOpen,
    targetElement,
    content,
    showTranscript,
    isTTSSpeaking,
    closeExplainer,
    toggleTranscript,
    setTTSSpeaking,
  } = useExplainOverlayStore();

  const { speak, stop, speechSupported, isSpeaking } = useSpeech();
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Update TTS speaking state
  useEffect(() => {
    setTTSSpeaking(isSpeaking);
  }, [isSpeaking, setTTSSpeaking]);

  // Handle TTS play/pause
  const handleSpeakToggle = useCallback((): void => {
    if (!content) return;

    if (isSpeaking) {
      stop();
    } else {
      speak(content.body);
    }
  }, [content, isSpeaking, speak, stop]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        closeExplainer();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, closeExplainer]);

  // Focus close button when opened
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Close on outside click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      closeExplainer();
    }
  };

  // Calculate position and arrow direction
  const getOverlayPosition = (): {
    top: number;
    left: number;
    arrowPosition: 'left' | 'right' | 'top' | 'bottom';
  } => {
    if (!targetElement) return { top: 50, left: 50, arrowPosition: 'left' };

    const rect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default: position to the right of the target
    let left = rect.right + 16;
    let top = rect.top;
    let arrowPosition: 'left' | 'right' | 'top' | 'bottom' = 'left';

    // If too far right, position to the left
    if (left + 400 > viewportWidth) {
      left = rect.left - 416; // 400px width + 16px gap
      arrowPosition = 'right';
    }

    // If too far left, position below
    if (left < 16) {
      left = rect.left;
      top = rect.bottom + 16;
      arrowPosition = 'top';
    }

    // If too far down, position above
    if (top + 300 > viewportHeight) {
      top = Math.max(16, rect.top - 316); // 300px height + 16px gap
      if (arrowPosition === 'top') arrowPosition = 'bottom';
    }

    return { top, left, arrowPosition };
  };

  const position =
    isOpen && targetElement
      ? getOverlayPosition()
      : { top: 50, left: 50, arrowPosition: 'left' as const };

  const animations = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.25 },
      };

  if (!isOpen || !content) return <></>;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with spotlight effect */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/30"
            style={{
              backdropFilter: 'blur(2px)',
            }}
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-live="polite"
            aria-atomic="true"
          >
            {/* Spotlight cutout effect - visual only */}
            {targetElement && (
              <div
                className="absolute border-4 border-white rounded-lg pointer-events-none"
                style={{
                  top: targetElement.getBoundingClientRect().top - 8,
                  left: targetElement.getBoundingClientRect().left - 8,
                  width: targetElement.getBoundingClientRect().width + 16,
                  height: targetElement.getBoundingClientRect().height + 16,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)',
                }}
                aria-hidden="true"
              />
            )}
          </motion.div>

          {/* Overlay bubble */}
          <motion.div
            ref={overlayRef}
            className="fixed z-50 bg-white rounded-2xl shadow-2xl p-6 max-w-md"
            style={{
              top: position.top,
              left: position.left,
            }}
            {...animations}
            role="dialog"
            aria-labelledby="explainer-title"
            aria-describedby="explainer-body"
          >
            {/* Arrow connector */}
            <div
              className={`absolute w-4 h-4 bg-white transform rotate-45 ${
                position.arrowPosition === 'left'
                  ? '-left-2 top-8'
                  : position.arrowPosition === 'right'
                  ? '-right-2 top-8'
                  : position.arrowPosition === 'top'
                  ? 'top-0 left-8 -translate-y-1/2'
                  : 'bottom-0 left-8 translate-y-1/2'
              }`}
              aria-hidden="true"
            />

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src="/assets/beaver/beaver_idea.png" alt="Beaver" className="w-12 h-12" />
                <h3 id="explainer-title" className="text-lg font-bold text-zus-text">
                  {content.title}
                </h3>
              </div>
              <button
                ref={closeButtonRef}
                onClick={closeExplainer}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Zamknij objaśnienie"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div id="explainer-body" className="text-gray-700 mb-4 leading-relaxed">
              {content.body}
            </div>

            {/* TTS Controls */}
            {speechSupported && (
              <div className="mb-4">
                <button
                  onClick={handleSpeakToggle}
                  className="px-4 py-2 bg-zus-primary text-white rounded-lg hover:bg-zus-accent transition-colors min-w-[44px] min-h-[44px] flex items-center gap-2"
                  aria-label={isTTSSpeaking ? 'Zatrzymaj czytanie' : 'Odtwórz głosowo'}
                >
                  {isTTSSpeaking ? '⏸' : '▶'} {isTTSSpeaking ? 'Zatrzymaj' : 'Odtwórz'}
                </button>
              </div>
            )}

            {/* Transcript Toggle */}
            <button
              onClick={toggleTranscript}
              className="text-sm text-zus-primary hover:underline mb-4 min-h-[44px] flex items-center"
              aria-expanded={showTranscript}
            >
              {showTranscript ? '▼ Ukryj transkrypcję' : '▶ Pokaż transkrypcję'}
            </button>

            {showTranscript && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-600">
                {content.body}
              </div>
            )}

            {/* Source & Learn More */}
            <div className="border-t pt-4 space-y-2">
              <p className="text-xs text-gray-500">
                Źródło:{' '}
                <a
                  href={content.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zus-primary hover:underline"
                >
                  {content.source.title}
                </a>
              </p>
              {content.relatedTips && content.relatedTips.length > 0 && (
                <p className="text-xs text-gray-500">
                  Powiązane tematy: {content.relatedTips.join(', ')}
                </p>
              )}
            </div>

            {/* Keyboard hint */}
            <p className="text-xs text-gray-400 mt-3">
              Naciśnij <kbd className="px-1 py-0.5 bg-gray-200 rounded">ESC</kbd> aby zamknąć
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
