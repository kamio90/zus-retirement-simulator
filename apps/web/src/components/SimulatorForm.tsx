/**
 * Simulator Form Component
 * Accessible form with client-side validation for pension simulation
 */
import { useState, FormEvent, ChangeEvent } from 'react';
import type { SimulateRequest, SimulationResult } from '@zus/types';
import { validateSimulateForm } from '../utils/validation';
import { simulatePension, ApiClientError } from '../services/api';
import type { ValidationError } from '../utils/validation';

interface SimulatorFormProps {
  onResult: (result: SimulationResult) => void;
}

interface FormData {
  birthYear: string;
  gender: 'M' | 'F' | '';
  startWorkYear: string;
  currentGrossMonthly: string;
  retirementAge: string;
  accumulatedInitialCapital: string;
  subAccountBalance: string;
  absenceFactor: string;
  claimMonth: string;
}

const initialFormData: FormData = {
  birthYear: '',
  gender: '',
  startWorkYear: '',
  currentGrossMonthly: '',
  retirementAge: '',
  accumulatedInitialCapital: '0',
  subAccountBalance: '0',
  absenceFactor: '1.0',
  claimMonth: '6',
};

export function SimulatorForm({ onResult }: SimulatorFormProps): JSX.Element {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    setErrors((prev) => prev.filter((err) => err.field !== name));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors([]);
    setServerError('');

    // Convert form data to numbers for validation
    const requestData = {
      birthYear: formData.birthYear ? parseInt(formData.birthYear, 10) : undefined,
      gender: formData.gender || undefined,
      startWorkYear: formData.startWorkYear ? parseInt(formData.startWorkYear, 10) : undefined,
      currentGrossMonthly: formData.currentGrossMonthly
        ? parseFloat(formData.currentGrossMonthly)
        : undefined,
      retirementAge: formData.retirementAge ? parseInt(formData.retirementAge, 10) : undefined,
      accumulatedInitialCapital: formData.accumulatedInitialCapital
        ? parseFloat(formData.accumulatedInitialCapital)
        : 0,
      subAccountBalance: formData.subAccountBalance ? parseFloat(formData.subAccountBalance) : 0,
      absenceFactor: formData.absenceFactor ? parseFloat(formData.absenceFactor) : 1.0,
      claimMonth: formData.claimMonth ? parseInt(formData.claimMonth, 10) : 6,
    };

    // Client-side validation
    const validation = validateSimulateForm(requestData);

    if (!validation.success) {
      setErrors(validation.errors || []);
      // Announce validation errors to screen readers
      const errorMessage = `Formularz zawiera ${validation.errors?.length} błędów walidacji`;
      announceToScreenReader(errorMessage);
      return;
    }

    // Submit to API
    setIsSubmitting(true);
    try {
      const result = await simulatePension(validation.data as SimulateRequest);
      onResult(result);
      announceToScreenReader('Symulacja zakończona pomyślnie');
    } catch (error) {
      if (error instanceof ApiClientError && error.apiError) {
        if (error.apiError.details?.issues) {
          const issues = error.apiError.details.issues as Array<{
            path: string;
            message: string;
          }>;
          setErrors(
            issues.map((issue) => ({
              field: issue.path,
              message: issue.message,
            }))
          );
        } else {
          setServerError(error.apiError.message);
        }
      } else {
        setServerError(error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd');
      }
      announceToScreenReader('Błąd podczas przetwarzania symulacji');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find((err) => err.field === fieldName)?.message;
  };

  const hasFieldError = (fieldName: string): boolean => {
    return errors.some((err) => err.field === fieldName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="form-status"
      />

      {/* Server error display */}
      {serverError && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md"
        >
          <p className="font-semibold">Błąd serwera:</p>
          <p>{serverError}</p>
        </div>
      )}

      {/* General validation errors */}
      {errors.length > 0 && !serverError && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md"
        >
          <p className="font-semibold mb-2">Formularz zawiera błędy:</p>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, idx) => (
              <li key={idx}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Birth Year */}
        <div>
          <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-1">
            Rok urodzenia{' '}
            <span className="text-red-600" aria-label="wymagane">
              *
            </span>
          </label>
          <input
            type="number"
            id="birthYear"
            name="birthYear"
            value={formData.birthYear}
            onChange={handleChange}
            required
            aria-required="true"
            aria-invalid={hasFieldError('birthYear')}
            aria-describedby={hasFieldError('birthYear') ? 'birthYear-error' : undefined}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zus-primary ${
              hasFieldError('birthYear') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder="np. 1980"
          />
          {hasFieldError('birthYear') && (
            <p id="birthYear-error" className="mt-1 text-sm text-red-600">
              {getFieldError('birthYear')}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Płeć{' '}
            <span className="text-red-600" aria-label="wymagane">
              *
            </span>
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            aria-required="true"
            aria-invalid={hasFieldError('gender')}
            aria-describedby={hasFieldError('gender') ? 'gender-error' : undefined}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zus-primary ${
              hasFieldError('gender') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Wybierz płeć</option>
            <option value="M">Mężczyzna</option>
            <option value="F">Kobieta</option>
          </select>
          {hasFieldError('gender') && (
            <p id="gender-error" className="mt-1 text-sm text-red-600">
              {getFieldError('gender')}
            </p>
          )}
        </div>

        {/* Start Work Year */}
        <div>
          <label htmlFor="startWorkYear" className="block text-sm font-medium text-gray-700 mb-1">
            Rok rozpoczęcia pracy{' '}
            <span className="text-red-600" aria-label="wymagane">
              *
            </span>
          </label>
          <input
            type="number"
            id="startWorkYear"
            name="startWorkYear"
            value={formData.startWorkYear}
            onChange={handleChange}
            required
            aria-required="true"
            aria-invalid={hasFieldError('startWorkYear')}
            aria-describedby={hasFieldError('startWorkYear') ? 'startWorkYear-error' : undefined}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zus-primary ${
              hasFieldError('startWorkYear')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            placeholder="np. 2000"
          />
          {hasFieldError('startWorkYear') && (
            <p id="startWorkYear-error" className="mt-1 text-sm text-red-600">
              {getFieldError('startWorkYear')}
            </p>
          )}
        </div>

        {/* Current Gross Monthly Salary */}
        <div>
          <label
            htmlFor="currentGrossMonthly"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Miesięczne wynagrodzenie brutto (PLN){' '}
            <span className="text-red-600" aria-label="wymagane">
              *
            </span>
          </label>
          <input
            type="number"
            id="currentGrossMonthly"
            name="currentGrossMonthly"
            value={formData.currentGrossMonthly}
            onChange={handleChange}
            required
            aria-required="true"
            aria-invalid={hasFieldError('currentGrossMonthly')}
            aria-describedby={
              hasFieldError('currentGrossMonthly') ? 'currentGrossMonthly-error' : undefined
            }
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zus-primary ${
              hasFieldError('currentGrossMonthly')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            placeholder="np. 5000"
            step="100"
          />
          {hasFieldError('currentGrossMonthly') && (
            <p id="currentGrossMonthly-error" className="mt-1 text-sm text-red-600">
              {getFieldError('currentGrossMonthly')}
            </p>
          )}
        </div>

        {/* Retirement Age (Optional) */}
        <div>
          <label htmlFor="retirementAge" className="block text-sm font-medium text-gray-700 mb-1">
            Wiek emerytalny (opcjonalnie)
          </label>
          <input
            type="number"
            id="retirementAge"
            name="retirementAge"
            value={formData.retirementAge}
            onChange={handleChange}
            aria-invalid={hasFieldError('retirementAge')}
            aria-describedby={
              hasFieldError('retirementAge') ? 'retirementAge-error' : 'retirementAge-help'
            }
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zus-primary ${
              hasFieldError('retirementAge')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            placeholder="Domyślnie: K=60, M=65"
          />
          {hasFieldError('retirementAge') ? (
            <p id="retirementAge-error" className="mt-1 text-sm text-red-600">
              {getFieldError('retirementAge')}
            </p>
          ) : (
            <p id="retirementAge-help" className="mt-1 text-sm text-gray-500">
              Jeśli nie podano, będzie automatycznie ustawiony na podstawie płci
            </p>
          )}
        </div>

        {/* Absence Factor */}
        <div>
          <label htmlFor="absenceFactor" className="block text-sm font-medium text-gray-700 mb-1">
            Współczynnik obecności
          </label>
          <input
            type="number"
            id="absenceFactor"
            name="absenceFactor"
            value={formData.absenceFactor}
            onChange={handleChange}
            aria-invalid={hasFieldError('absenceFactor')}
            aria-describedby={
              hasFieldError('absenceFactor') ? 'absenceFactor-error' : 'absenceFactor-help'
            }
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zus-primary ${
              hasFieldError('absenceFactor')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            step="0.01"
            min="0.7"
            max="1.0"
          />
          {hasFieldError('absenceFactor') ? (
            <p id="absenceFactor-error" className="mt-1 text-sm text-red-600">
              {getFieldError('absenceFactor')}
            </p>
          ) : (
            <p id="absenceFactor-help" className="mt-1 text-sm text-gray-500">
              Wartość od 0.7 do 1.0 (domyślnie 1.0)
            </p>
          )}
        </div>

        {/* Accumulated Initial Capital */}
        <div>
          <label
            htmlFor="accumulatedInitialCapital"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Skumulowany kapitał początkowy (PLN)
          </label>
          <input
            type="number"
            id="accumulatedInitialCapital"
            name="accumulatedInitialCapital"
            value={formData.accumulatedInitialCapital}
            onChange={handleChange}
            aria-invalid={hasFieldError('accumulatedInitialCapital')}
            aria-describedby={
              hasFieldError('accumulatedInitialCapital')
                ? 'accumulatedInitialCapital-error'
                : undefined
            }
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zus-primary ${
              hasFieldError('accumulatedInitialCapital')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            step="100"
            min="0"
          />
          {hasFieldError('accumulatedInitialCapital') && (
            <p id="accumulatedInitialCapital-error" className="mt-1 text-sm text-red-600">
              {getFieldError('accumulatedInitialCapital')}
            </p>
          )}
        </div>

        {/* Sub-account Balance */}
        <div>
          <label
            htmlFor="subAccountBalance"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Saldo subkonta (PLN)
          </label>
          <input
            type="number"
            id="subAccountBalance"
            name="subAccountBalance"
            value={formData.subAccountBalance}
            onChange={handleChange}
            aria-invalid={hasFieldError('subAccountBalance')}
            aria-describedby={
              hasFieldError('subAccountBalance') ? 'subAccountBalance-error' : undefined
            }
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zus-primary ${
              hasFieldError('subAccountBalance')
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300'
            }`}
            step="100"
            min="0"
          />
          {hasFieldError('subAccountBalance') && (
            <p id="subAccountBalance-error" className="mt-1 text-sm text-red-600">
              {getFieldError('subAccountBalance')}
            </p>
          )}
        </div>

        {/* Claim Month */}
        <div>
          <label htmlFor="claimMonth" className="block text-sm font-medium text-gray-700 mb-1">
            Miesiąc rozpoczęcia emerytury
          </label>
          <select
            id="claimMonth"
            name="claimMonth"
            value={formData.claimMonth}
            onChange={handleChange}
            aria-invalid={hasFieldError('claimMonth')}
            aria-describedby={hasFieldError('claimMonth') ? 'claimMonth-error' : undefined}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zus-primary ${
              hasFieldError('claimMonth') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
          >
            <option value="1">Styczeń</option>
            <option value="2">Luty</option>
            <option value="3">Marzec</option>
            <option value="4">Kwiecień</option>
            <option value="5">Maj</option>
            <option value="6">Czerwiec</option>
            <option value="7">Lipiec</option>
            <option value="8">Sierpień</option>
            <option value="9">Wrzesień</option>
            <option value="10">Październik</option>
            <option value="11">Listopad</option>
            <option value="12">Grudzień</option>
          </select>
          {hasFieldError('claimMonth') && (
            <p id="claimMonth-error" className="mt-1 text-sm text-red-600">
              {getFieldError('claimMonth')}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-zus-primary text-white font-semibold rounded-md hover:bg-zus-accent focus:outline-none focus:ring-2 focus:ring-zus-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Obliczanie...' : 'Oblicz emeryturę'}
        </button>
      </div>
    </form>
  );
}

// Helper function to announce messages to screen readers
function announceToScreenReader(message: string): void {
  const statusElement = document.getElementById('form-status');
  if (statusElement) {
    statusElement.textContent = message;
  }
}
