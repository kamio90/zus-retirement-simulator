/**
 * Results Display Component
 * Shows simulation results with charts and export options
 */
import { useEffect, useState } from 'react';
import type { SimulationResult, SimulateRequest } from '@zus/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchBenchmarks, type BenchmarksResponse } from '../services/api';
import { exportToPdfServer } from '../utils/exportPdfServer';
import { exportToXls } from '../utils/exportXls';

interface ResultsDisplayProps {
  result: SimulationResult;
  input: SimulateRequest;
}

export function ResultsDisplay({ result, input }: ResultsDisplayProps): JSX.Element {
  const [benchmarks, setBenchmarks] = useState<BenchmarksResponse | null>(null);
  const [loadingBenchmarks, setLoadingBenchmarks] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingXls, setExportingXls] = useState(false);

  useEffect(() => {
    // Fetch benchmarks when results are displayed
    const loadBenchmarks = async (): Promise<void> => {
      setLoadingBenchmarks(true);
      try {
        const data = await fetchBenchmarks(undefined, result.scenario.gender);
        setBenchmarks(data);
      } catch (error) {
        console.error('Failed to load benchmarks:', error);
      } finally {
        setLoadingBenchmarks(false);
      }
    };

    loadBenchmarks();
  }, [result.scenario.gender]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  };

  const handleExportPdf = async (): Promise<void> => {
    setExportingPdf(true);
    try {
      await exportToPdfServer(result, input);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Nie udało się wyeksportować do PDF. Spróbuj ponownie.');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportXls = async (): Promise<void> => {
    setExportingXls(true);
    try {
      await exportToXls(result, benchmarks || undefined);
    } catch (error) {
      console.error('XLS export failed:', error);
      alert('Nie udało się wyeksportować do XLS. Spróbuj ponownie.');
    } finally {
      setExportingXls(false);
    }
  };

  // Prepare chart data
  const chartData = result.capitalTrajectory.map((item) => ({
    rok: item.year,
    'Kapitał skumulowany': item.cumulativeCapitalAfterAnnual,
    'Roczne wynagrodzenie': item.annualWage,
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-zus-primary mb-6">Wyniki Symulacji Emerytalnej</h2>

      {/* Key Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zus-secondary border border-zus-primary p-4 rounded-md">
          <p className="text-sm font-medium text-gray-600 mb-1">Miesięczna emerytura (nominalna)</p>
          <p className="text-2xl font-bold text-zus-primary">
            {formatCurrency(result.monthlyPensionNominal)}
          </p>
        </div>

        <div className="bg-zus-secondary border border-zus-primary p-4 rounded-md">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Miesięczna emerytura (wartość dzisiejsza)
          </p>
          <p className="text-2xl font-bold text-zus-primary">
            {formatCurrency(result.monthlyPensionRealToday)}
          </p>
        </div>

        <div className="bg-zus-secondary border border-zus-primary p-4 rounded-md">
          <p className="text-sm font-medium text-gray-600 mb-1">Stopa zastąpienia</p>
          <p className="text-2xl font-bold text-zus-primary">
            {formatPercentage(result.replacementRate)}
          </p>
        </div>
      </div>

      {/* Scenario Details */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Szczegóły scenariusza</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Wiek emerytalny</p>
            <p className="font-semibold">{result.scenario.retirementAge} lat</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Rok emerytury</p>
            <p className="font-semibold">{result.scenario.retirementYear}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Miesiąc zgłoszenia</p>
            <p className="font-semibold">{result.scenario.claimMonth}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Płeć</p>
            <p className="font-semibold">
              {result.scenario.gender === 'M' ? 'Mężczyzna' : 'Kobieta'}
            </p>
          </div>
        </div>
      </div>

      {/* Benchmarks Comparison */}
      {loadingBenchmarks && (
        <div className="mb-8 bg-gray-50 border border-gray-200 rounded-md p-4">
          <p className="text-gray-600">Ładowanie danych porównawczych...</p>
        </div>
      )}

      {benchmarks && !loadingBenchmarks && (
        <div className="mb-8 bg-zus-secondary border border-zus-primary rounded-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Porównanie z benchmarkami</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Średnia krajowa</p>
              <p className="text-xl font-bold text-zus-primary">
                {formatCurrency(benchmarks.nationalAvgPension)}
              </p>
            </div>
            {benchmarks.powiatAvgPension && benchmarks.powiatResolved && (
              <div>
                <p className="text-sm text-gray-600">Średnia w {benchmarks.powiatResolved.name}</p>
                <p className="text-xl font-bold text-zus-primary">
                  {formatCurrency(benchmarks.powiatAvgPension)}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Twoja emerytura</p>
              <p className="text-xl font-bold text-zus-accent">
                {((result.monthlyPensionRealToday / benchmarks.nationalAvgPension) * 100).toFixed(
                  1
                )}
                %<span className="text-sm font-normal ml-1">średniej krajowej</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Capital Trajectory Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Wykres trajektorii kapitału</h3>
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rok" label={{ value: 'Rok', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Wartość (PLN)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Rok: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Kapitał skumulowany"
                stroke="#007a33"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Roczne wynagrodzenie"
                stroke="#004c1d"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Capital Trajectory Summary */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Trajektoria kapitału</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rok
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Roczne wynagrodzenie
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Składka roczna
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Kapitał skumulowany
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.capitalTrajectory
                .slice(0, 5)
                .map(
                  (row: {
                    year: number;
                    annualWage: number;
                    annualContribution: number;
                    cumulativeCapitalAfterAnnual: number;
                  }) => (
                    <tr key={row.year}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(row.annualWage)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(row.annualContribution)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(row.cumulativeCapitalAfterAnnual)}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
          {result.capitalTrajectory.length > 5 && (
            <p className="mt-2 text-sm text-gray-500 text-center">
              Wyświetlono 5 z {result.capitalTrajectory.length} wierszy
            </p>
          )}
        </div>
      </div>

      {/* Assumptions */}
      <div className="bg-gray-50 rounded-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Założenia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">Rodzaj dostawcy:</span>{' '}
            <span className="text-gray-600">{result.assumptions.providerKind}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Waloryzacja roczna:</span>{' '}
            <span className="text-gray-600">{result.assumptions.annualValorizationSetId}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Waloryzacja kwartalna:</span>{' '}
            <span className="text-gray-600">{result.assumptions.quarterlySetId}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Tabela SDŻ:</span>{' '}
            <span className="text-gray-600">{result.assumptions.sdżTableId}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Wersja CPI:</span>{' '}
            <span className="text-gray-600">{result.assumptions.cpiVintage}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Wersja płac:</span>{' '}
            <span className="text-gray-600">{result.assumptions.wageVintage}</span>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          className="px-6 py-2 bg-zus-primary text-white font-semibold rounded-md hover:bg-zus-accent focus:outline-none focus:ring-2 focus:ring-zus-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleExportPdf}
          disabled={exportingPdf}
        >
          {exportingPdf ? 'Eksportowanie...' : 'Eksportuj do PDF'}
        </button>
        <button
          className="px-6 py-2 bg-zus-primary text-white font-semibold rounded-md hover:bg-zus-accent focus:outline-none focus:ring-2 focus:ring-zus-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleExportXls}
          disabled={exportingXls}
        >
          {exportingXls ? 'Eksportowanie...' : 'Eksportuj do XLS'}
        </button>
      </div>
    </div>
  );
}
