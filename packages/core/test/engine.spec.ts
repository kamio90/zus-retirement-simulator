import { calculatePension } from '../src/engine';
import * as path from 'path';
import * as fs from 'fs';
import { SimulateInput, SimulationResult } from '@types';

describe('Pension Engine — Data-driven tests', () => {
  const loadFixture = (name: string) => {
    const file = path.join(__dirname, `fixtures.${name}.json`);
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  };

  const scenarios = ['young', 'midcareer', 'nearretirement', 'absence'];

  scenarios.forEach(scenario => {
    it(`should satisfy invariants for ${scenario}`, () => {
      const { input, expected } = loadFixture(scenario);
      // TODO: load mock data from @data
      const mockData = {};
      const result: SimulationResult = calculatePension(input, mockData);
      expect(result.pensionNominal).toBeGreaterThanOrEqual(expected.minNominal);
      expect(result.pensionReal).toBeLessThanOrEqual(result.pensionNominal);
      expect(result.replacementRate).toBeLessThanOrEqual(expected.maxReplacementRate);
      expect(result.capitalTrajectory.length).toBe(expected.trajectoryLength);
    });
  });

  it('should match golden snapshot when updated', () => {
    const { input, expected } = loadFixture('golden');
    // TODO: load mock data from @data
    const mockData = {};
    const result: SimulationResult = calculatePension(input, mockData);
    expect(result.pensionNominal).toEqual(expected.nominal);
    expect(result.pensionReal).toEqual(expected.real);
    expect(result.replacementRate).toEqual(expected.replacementRate);
    expect(result.capitalTrajectory).toEqual(expected.trajectory);
  });
});
