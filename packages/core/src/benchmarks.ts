/**
 * Benchmarks calculation module
 *
 * Provides functions to get national and regional pension benchmarks
 */

import { loadPowiatyData, findPowiatByTeryt } from '@zus/data';

export interface BenchmarksInput {
  powiatTeryt?: string;
  gender?: 'M' | 'F';
}

export interface BenchmarksResult {
  nationalAvgPension: number;
  powiatAvgPension?: number;
  powiatResolved?: {
    name: string;
    teryt: string;
  };
}

/**
 * Calculate benchmark pension values
 *
 * @param input - Query parameters for benchmarks
 * @returns Benchmark results with national and optional powiat averages
 */
export function calculateBenchmarks(input: BenchmarksInput): BenchmarksResult {
  const data = loadPowiatyData();

  // Get national average based on gender
  let nationalAvgPension: number;
  if (input.gender === 'M') {
    nationalAvgPension = data.nationalAverage.male;
  } else if (input.gender === 'F') {
    nationalAvgPension = data.nationalAverage.female;
  } else {
    nationalAvgPension = data.nationalAverage.overall;
  }

  const result: BenchmarksResult = {
    nationalAvgPension,
  };

  // Add powiat data if TERYT code provided
  if (input.powiatTeryt) {
    const powiat = findPowiatByTeryt(input.powiatTeryt);

    if (powiat) {
      // Get gender-specific or overall average
      let powiatAvg: number | null = null;

      if (input.gender === 'M') {
        powiatAvg = powiat.avgPensionMale;
      } else if (input.gender === 'F') {
        powiatAvg = powiat.avgPensionFemale;
      } else {
        // Calculate overall average for powiat
        const validPensions = [powiat.avgPensionMale, powiat.avgPensionFemale].filter(
          (p): p is number => p !== null
        );
        powiatAvg =
          validPensions.length > 0
            ? validPensions.reduce((sum, p) => sum + p, 0) / validPensions.length
            : null;
      }

      if (powiatAvg !== null) {
        result.powiatAvgPension = powiatAvg;
        result.powiatResolved = {
          name: powiat.name,
          teryt: powiat.teryt,
        };
      }
    }
  }

  return result;
}
