/**
 * Powiat benchmark data types and loader
 */

export interface PowiatBenchmark {
  name: string;
  teryt: string;
  avgPensionMale: number | null;
  avgPensionFemale: number | null;
}

export interface NationalAverage {
  overall: number;
  male: number;
  female: number;
}

export interface PowiatyData {
  version: string;
  source: string;
  dataDate: string;
  description: string;
  nationalAverage: NationalAverage;
  powiaty: PowiatBenchmark[];
}

/**
 * Load powiat benchmark data
 */
export function loadPowiatyData(): PowiatyData {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const data = require('./json/powiaty.json');
  return data as PowiatyData;
}

/**
 * Find powiat by TERYT code
 */
export function findPowiatByTeryt(teryt: string): PowiatBenchmark | undefined {
  const data = loadPowiatyData();
  return data.powiaty.find((p) => p.teryt === teryt);
}

/**
 * Get national average pension
 */
export function getNationalAverage(gender?: 'M' | 'F'): number {
  const data = loadPowiatyData();
  if (gender === 'M') {
    return data.nationalAverage.male;
  } else if (gender === 'F') {
    return data.nationalAverage.female;
  }
  return data.nationalAverage.overall;
}
