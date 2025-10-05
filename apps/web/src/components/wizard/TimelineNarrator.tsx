/**
 * Timeline Narrator - Story of Your Pension
 * Year-by-year journey with Beaver narration
 */
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeech } from '../../hooks/useSpeech';

interface YearCard {
  year: number;
  contributions: number;
  annualIndex: number;
  capitalAfterAnnual: number;
  gap?: boolean;
  microfact?: string;
}

interface TimelineNarratorProps {
  trajectory: YearCard[];
  finalYearQuarters?: string[];
  onClose: () => void;
}

const microfacts = [
  'Składka emerytalna to 19,52% Twojej podstawy wynagrodzenia',
  'Waloryzacja roczna chroni Twój kapitał przed inflacją',
  'ZUS dzieli kapitał przez średnie dalsze trwanie życia (SDŻ)',
  'Każdy rok pracy to więcej kapitału na emeryturę',
  'Kwartalny wskaźnik waloryzacji ma znaczenie w ostatnim roku',
  'Kapitał początkowy z przed 1999 jest mnożony przez 1,1560',
  'Przerwy w składkach zmniejszają kapitał emerytalny',
  'Wyższe składki = wyższa emerytura w przyszłości',
  'Opóźnienie emerytury zwiększa miesięczną kwotę',
  'System zdefiniowanej składki = Twoja skarbonka emerytalna',
  'Realna wartość emerytury uwzględnia inflację',
  'Stopa zastąpienia to stosunek emerytury do wynagrodzenia',
];

// Use microfacts for future enhancements
console.debug('Available microfacts:', microfacts.length);

export function TimelineNarrator({
  trajectory,
  finalYearQuarters = [],
  onClose,
}: TimelineNarratorProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showQuarters, setShowQuarters] = useState(false);
  const { speak, stop, speechSupported } = useSpeech();
  const timelineRef = useRef<HTMLDivElement>(null);

  const currentCard = trajectory[currentIndex];
  const progress = ((currentIndex + 1) / trajectory.length) * 100;

  const narrationText = currentCard
    ? `Rok ${currentCard.year}. ${currentCard.gap ? 'Przerwa w składkach' : `Składka ${Math.round(currentCard.contributions).toLocaleString('pl-PL')} PLN`}. Waloryzacja roczna ${currentCard.annualIndex.toFixed(1)}%. Kapitał po waloryzacji: ${Math.round(currentCard.capitalAfterAnnual).toLocaleString('pl-PL')} PLN. ${currentCard.microfact || ''}`
    : '';

  const handlePlay = (): void => {
    setIsPlaying(true);
    playNarration();
  };

  const playNarration = (): void => {
    if (currentIndex >= trajectory.length) {
      setIsPlaying(false);
      return;
    }

    speak(narrationText);

    // Auto-advance after narration (simulate 3s per card)
    setTimeout(() => {
      if (currentIndex < trajectory.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setTimeout(() => playNarration(), 500);
      } else {
        setIsPlaying(false);
      }
    }, 3000);
  };

  const handlePause = (): void => {
    setIsPlaying(false);
    stop();
  };

  const handleJumpToYear = (index: number): void => {
    setCurrentIndex(index);
    if (isPlaying) {
      stop();
      setIsPlaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-zus-primary text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">🦫 Historia Twojej Emerytury</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
              aria-label="Zamknij"
            >
              ✕
            </button>
          </div>
          <p className="text-sm opacity-90">Podróż od pierwszej składki do emerytury</p>

          {/* Progress bar */}
          <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-white h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div ref={timelineRef} className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Year Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard?.year}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className={`border-2 rounded-lg p-6 mb-6 ${currentCard?.gap ? 'border-red-300 bg-red-50' : 'border-zus-primary bg-zus-secondary'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-bold text-zus-text">{currentCard?.year}</h3>
                <div className="text-4xl" aria-hidden="true">
                  {currentCard?.gap ? '⏸️' : '💰'}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Składka roczna:</span>
                  <span className="font-semibold">
                    {currentCard?.gap
                      ? '0 PLN (przerwa)'
                      : `${Math.round(currentCard?.contributions || 0).toLocaleString('pl-PL')} PLN`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Wskaźnik roczny:</span>
                  <span className="font-semibold">{currentCard?.annualIndex.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kapitał po waloryzacji:</span>
                  <span className="font-semibold text-zus-primary">
                    {Math.round(currentCard?.capitalAfterAnnual || 0).toLocaleString('pl-PL')} PLN
                  </span>
                </div>
              </div>

              {currentCard?.microfact && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Wiedziałeś, że:</strong> {currentCard.microfact}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Final Year Quarters */}
          {currentIndex === trajectory.length - 1 && finalYearQuarters.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setShowQuarters(!showQuarters)}
                className="text-sm text-zus-primary hover:underline mb-2"
              >
                {showQuarters ? '▼ Ukryj kwartały ostatniego roku' : '▶ Pokaż kwartały ostatniego roku'}
              </button>
              {showQuarters && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Zastosowane kwartały:</strong>
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {finalYearQuarters.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center gap-4 mb-4">
            {/* Play/Pause */}
            {speechSupported && (
              <button
                onClick={isPlaying ? handlePause : handlePlay}
                className="px-6 py-3 bg-zus-primary text-white rounded-lg hover:bg-zus-accent transition-colors font-semibold"
              >
                {isPlaying ? '⏸ Pauza' : '▶ Odtwórz narrację'}
              </button>
            )}

            {/* Transcript */}
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-sm text-zus-primary hover:underline"
            >
              {showTranscript ? '▼ Ukryj transkrypcję' : '▶ Pokaż transkrypcję'}
            </button>
          </div>

          {showTranscript && (
            <div className="bg-white rounded-lg p-4 text-sm text-gray-700 mb-4">
              {narrationText}
            </div>
          )}

          {/* Year Jump Minimap */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {trajectory.map((card, idx) => (
              <button
                key={card.year}
                onClick={() => handleJumpToYear(idx)}
                className={`flex-shrink-0 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  idx === currentIndex
                    ? 'bg-zus-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label={`Przejdź do roku ${card.year}`}
              >
                {card.year}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
