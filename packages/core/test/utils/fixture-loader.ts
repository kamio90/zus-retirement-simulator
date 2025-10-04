/**
 * Fixture Loader Utility
 * Loads and parses golden fixture files for testing
 */

import * as fs from 'fs';
import * as path from 'path';
import { EngineInput } from '../../src/contracts';

export interface FixtureInput {
  birthYear: number;
  gender: 'M' | 'F';
  startWorkYear: number;
  currentGrossMonthly: number;
  retirementAge?: number;
  accumulatedInitialCapital?: number;
  subAccountBalance?: number;
  absenceFactor?: number;
  claimMonth?: number;
  anchorYear?: number;
}

export interface StructuralExpectations {
  trajectoryLength?: number;
  trajectoryMonotonic?: boolean;
  minNominal?: number;
  maxNominal?: number;
  minReplacementRate?: number;
  maxReplacementRate?: number;
  annualIndexIdPattern?: string;
  quarterlyIndexIdPattern?: string;
  lifeTableIdPattern?: string;
  finalizationQuarterCount?: number;
  finalizationQuarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  explainerContains?: string[];
  explainerMinLength?: number;
  compareTo?: {
    fixtureName: string;
    property: string;
    relation: 'GT' | 'LT' | 'GTE' | 'LTE' | 'EQ';
  };
}

export interface NumericGoldenExpectations {
  monthlyPensionNominal: number;
  monthlyPensionRealToday: number;
  replacementRate: number;
  capitalTrajectory: Array<{
    year: number;
    cumulativeCapital: number;
  }>;
  dataVersion: string;
  providerKind: string;
}

export interface GoldenFixture {
  name: string;
  description: string;
  category: 'baseline' | 'edge-case' | 'comparative' | 'provider-specific';
  tags: string[];
  input: FixtureInput;
  structural: StructuralExpectations;
  numeric?: NumericGoldenExpectations;
}

export interface LoadedFixture {
  fixture: GoldenFixture;
  engineInput: EngineInput;
}

/**
 * Load a single fixture from a JSON file
 */
export function loadFixture(fixturePath: string): LoadedFixture {
  const absolutePath = path.isAbsolute(fixturePath)
    ? fixturePath
    : path.resolve(__dirname, '..', fixturePath);

  const fixtureJson = fs.readFileSync(absolutePath, 'utf-8');
  const fixture: GoldenFixture = JSON.parse(fixtureJson);

  const engineInput: EngineInput = {
    birthYear: fixture.input.birthYear,
    gender: fixture.input.gender,
    startWorkYear: fixture.input.startWorkYear,
    currentGrossMonthly: fixture.input.currentGrossMonthly,
    retirementAge: fixture.input.retirementAge,
    accumulatedInitialCapital: fixture.input.accumulatedInitialCapital,
    subAccountBalance: fixture.input.subAccountBalance,
    absenceFactor: fixture.input.absenceFactor,
    claimMonth: fixture.input.claimMonth,
    anchorYear: fixture.input.anchorYear,
  };

  return { fixture, engineInput };
}

/**
 * Load all fixtures matching a glob pattern
 * Note: For simplicity, this uses a directory pattern instead of glob
 */
export function loadAllFixtures(dirPath: string): LoadedFixture[] {
  const absolutePath = path.isAbsolute(dirPath)
    ? dirPath
    : path.resolve(__dirname, '..', dirPath);

  const files = fs.readdirSync(absolutePath).filter((f) => f.endsWith('.json'));

  return files.map((file) => loadFixture(path.join(absolutePath, file)));
}
