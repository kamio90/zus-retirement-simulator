/**
 * Step 1 - Gender & Age Selection
 * Gender cards with icons and age slider
 */
import { motion } from 'framer-motion';
import { useWizardStore, Gender } from '../../store/wizardStore';
import { BeaverCoach } from './BeaverCoach';
import { FieldHelp } from './FieldHelp';
import fieldHelpContent from '../../data/field-help.json';

export function Step1GenderAge(): JSX.Element {
  const { gender, age, setGender, setAge } = useWizardStore();

  const genderOptions: { value: Gender; label: string; icon: string }[] = [
    { value: 'female', label: 'Kobieta', icon: '👩' },
    { value: 'male', label: 'Mężczyzna', icon: '👨' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-zus-text mb-2">Wybierz płeć i wiek</h2>
      <p className="text-gray-600 mb-8">
        Te dane określają domyślny wiek emerytalny zgodnie z przepisami ZUS
      </p>

      {/* Gender Selection */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <label className="block text-lg font-semibold text-zus-text">Płeć</label>
          <FieldHelp
            fieldId="gender"
            explanation={fieldHelpContent['pl-PL'].gender.explanation}
            example={fieldHelpContent['pl-PL'].gender.example}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {genderOptions.map((option) => (
            <motion.div
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <div
                onClick={() => setGender(option.value)}
                className={`
                  cursor-pointer transition-all duration-300 bg-white rounded-lg shadow-md
                  ${
                    gender === option.value
                      ? 'ring-4 ring-zus-primary bg-zus-secondary shadow-xl'
                      : 'hover:shadow-lg hover:ring-2 hover:ring-zus-border'
                  }
                `}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setGender(option.value);
                  }
                }}
                aria-pressed={gender === option.value}
                aria-label={`Wybierz płeć: ${option.label}`}
              >
                <div className="flex items-center justify-center gap-4 py-8 px-4">
                  <span className="text-5xl" role="img" aria-label={option.label}>
                    {option.icon}
                  </span>
                  <span className="text-2xl font-bold text-zus-text">{option.label}</span>
                  {gender === option.value && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-zus-primary text-2xl"
                    >
                      ✓
                    </motion.span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Age Slider */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <label htmlFor="age-slider" className="block text-lg font-semibold text-zus-text">
            Wiek: <span className="text-zus-primary">{age} lat</span>
          </label>
          <FieldHelp
            fieldId="age"
            explanation={fieldHelpContent['pl-PL'].age.explanation}
            example={fieldHelpContent['pl-PL'].age.example}
          />
        </div>

        <div className="relative px-2">
          <input
            id="age-slider"
            type="range"
            min="18"
            max="80"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            aria-valuemin={18}
            aria-valuemax={80}
            aria-valuenow={age}
            aria-label={`Wiek: ${age} lat`}
          />

          {/* Tick marks every 5 years */}
          <div className="flex justify-between mt-2 px-1">
            {[20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80].map((tick) => (
              <div key={tick} className="flex flex-col items-center">
                <div className="w-px h-2 bg-gray-400" />
                <span className="text-xs text-gray-500 mt-1">{tick}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Beaver Coach */}
      <BeaverCoach
        message="Wybierz swoją płeć i wiek — to pomoże mi określić domyślny wiek emerytalny. Dla kobiet to 60 lat, dla mężczyzn 65 lat (zgodnie z obecnymi przepisami)."
        tone="info"
        pose="wave"
      />

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #007a33;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .slider-thumb::-webkit-slider-thumb:focus {
          outline: 2px solid #007a33;
          outline-offset: 2px;
        }

        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #007a33;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        @media (prefers-reduced-motion: reduce) {
          .slider-thumb::-webkit-slider-thumb,
          .slider-thumb::-moz-range-thumb {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
