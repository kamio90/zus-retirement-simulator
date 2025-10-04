/**
 * BeaverCoach Component - Friendly assistant with speech bubble
 * Version 2.0: Real PNG assets, TTS with voice selection, and enhanced controls
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';

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
  | 'info'
  | 'celebrate';

export interface BeaverCoachProps {
  message: string;
  tone?: 'info' | 'tip' | 'warning';
  pose?: BeaverPose;
  ctaLabel?: string;
  onCta?: () => void;
  canMinimize?: boolean;
  startMinimized?: boolean;
  stepId?: string;
  title?: string;
}

const toneStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-900',
  tip: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
};

// Map poses to PNG asset filenames
const poseAssets: Record<BeaverPose, string> = {
  idle: 'beaver_idle.png',
  wave: 'beaver_wave.png',
  'point-left': 'beaver_point_left.png',
  'point-right': 'beaver_point_right.png',
  think: 'beaver_think.png',
  read: 'beaver_read.png',
  typing: 'beaver_typing.png',
  idea: 'beaver_idea.png',
  warning: 'beaver_warning.png',
  info: 'beaver_info.png',
  celebrate: 'beaver_celebrate.png',
};

export function BeaverCoach({
  message,
  tone = 'info',
  pose = 'idle',
  ctaLabel,
  onCta,
  canMinimize = true,
  startMinimized = false,
  stepId: _stepId, // eslint-disable-line @typescript-eslint/no-unused-vars
  title,
}: BeaverCoachProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [isMinimized, setIsMinimized] = useState(startMinimized);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  const { voices, settings, isSpeaking, speak, stop, updateSettings, speechSupported } =
    useSpeech();

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
    if (speechSupported) {
      stop();
    }
  }, [message, speechSupported, stop]);

  // Handle speak/stop toggle
  const handleSpeakToggle = (): void => {
    if (isSpeaking) {
      stop();
    } else {
      speak(message);
    }
  };

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

  // If minimized, show FAB
  if (isMinimized) {
    return (
      <motion.button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full bg-zus-primary shadow-lg hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-zus-primary focus:ring-offset-2"
        aria-label="Pokaż Beaver Coach"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          src="/assets/beaver/beaver_idle.png"
          alt="Beaver Coach"
          className="w-full h-full object-contain p-2"
        />
      </motion.button>
    );
  }

  return (
    <div className="beaver-coach-container fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50 max-w-md md:max-w-lg">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div {...animations} className="flex items-start gap-4">
            {/* Beaver Image - Real PNG asset */}
            <div className="flex-shrink-0">
              <motion.div
                animate={shouldReduceMotion ? {} : { y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <img
                  src={`/assets/beaver/${poseAssets[pose]}`}
                  alt={`Beaver Coach, ${pose} pose`}
                  className="w-36 h-36 md:w-48 md:h-48 lg:w-60 lg:h-60 object-contain"
                />
              </motion.div>
            </div>

            {/* Speech Bubble */}
            <div
              className={`relative flex-1 p-5 rounded-lg border-2 shadow-lg ${toneStyles[tone]}`}
              role="dialog"
              aria-labelledby="beaver-coach-title"
              aria-describedby="beaver-coach-message"
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

              {/* Header Row */}
              <div className="flex items-center gap-2 mb-3">
                <span id="beaver-coach-title" className="text-sm font-bold">
                  {title || 'Beaver Coach'}
                </span>

                {/* Minimize button */}
                {canMinimize && (
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="ml-auto p-2 text-base hover:bg-white/50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-zus-primary min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Minimalizuj"
                  >
                    ×
                  </button>
                )}

                {/* TTS Controls */}
                {speechSupported && (
                  <>
                    <button
                      onClick={handleSpeakToggle}
                      className="px-3 py-2 text-sm font-medium rounded transition-colors hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-zus-primary min-w-[44px] min-h-[44px]"
                      aria-label={isSpeaking ? 'Zatrzymaj czytanie' : 'Odczytaj wiadomość'}
                      aria-live="polite"
                    >
                      {isSpeaking ? '🔊 Zatrzymaj' : '🔇 Odczytaj'}
                    </button>

                    {/* Voice selector toggle */}
                    <button
                      onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                      className="px-3 py-2 text-sm rounded transition-colors hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-zus-primary min-w-[44px] min-h-[44px]"
                      aria-label="Ustawienia głosu"
                    >
                      ⚙️
                    </button>
                  </>
                )}
              </div>

              {/* Voice Selector Dropdown */}
              {speechSupported && showVoiceSelector && (
                <div className="mb-3 p-3 bg-white/50 rounded-md space-y-2">
                  <div>
                    <label htmlFor="voice-select" className="text-xs font-medium block mb-1">
                      Głos:
                    </label>
                    <select
                      id="voice-select"
                      value={settings.voiceName || ''}
                      onChange={(e) =>
                        updateSettings({ ...settings, voiceName: e.target.value || null })
                      }
                      className="w-full text-xs p-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-zus-primary"
                    >
                      <option value="">Domyślny</option>
                      {voices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="rate-slider" className="text-xs font-medium block mb-1">
                        Prędkość: {settings.rate.toFixed(1)}
                      </label>
                      <input
                        id="rate-slider"
                        type="range"
                        min="0.9"
                        max="1.1"
                        step="0.1"
                        value={settings.rate}
                        onChange={(e) =>
                          updateSettings({ ...settings, rate: parseFloat(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="pitch-slider" className="text-xs font-medium block mb-1">
                        Ton: {settings.pitch.toFixed(1)}
                      </label>
                      <input
                        id="pitch-slider"
                        type="range"
                        min="-2"
                        max="2"
                        step="0.5"
                        value={settings.pitch}
                        onChange={(e) =>
                          updateSettings({ ...settings, pitch: parseFloat(e.target.value) })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Message - Show/hide based on transcript toggle */}
              {showTranscript && (
                <p id="beaver-coach-message" className="text-base leading-relaxed mb-3">
                  {message}
                </p>
              )}

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
                  className="mt-4 w-full px-4 py-3 bg-zus-primary text-white text-base font-semibold rounded-md hover:bg-zus-accent transition-colors focus:outline-none focus:ring-2 focus:ring-zus-primary min-h-[44px]"
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
