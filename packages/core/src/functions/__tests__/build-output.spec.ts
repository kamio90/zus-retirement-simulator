/**
 * Unit tests for buildOutput
 * Tests output structure assembly and mapping logic
 */
import { buildOutput, BuildOutputParams } from '../build-output';
import { AnnualValorizedState } from '../annual-valorization';
import { FinalizationStep } from '../quarterly-valorization';
import { BaseComposition } from '../compose-base';
import { LifeExpectancySelection } from '../life-expectancy';
import { PensionCalcsResult } from '../pension-calcs';

describe('buildOutput', () => {
  describe('happy path', () => {
    it('should build complete output structure', () => {
      const params: BuildOutputParams = {
        scenario: {
          retirementAge: 65,
          retirementYear: 2055,
          claimMonth: 6,
          gender: 'M',
        },
        annualTrajectory: [
          {
            year: 2010,
            contributionAdded: 10000,
            annualIndexAppliedId: 'ANNUAL.2010.1.05',
            cumulativeCapitalAfterAnnual: 10500,
          },
          {
            year: 2011,
            contributionAdded: 11000,
            annualIndexAppliedId: 'ANNUAL.2011.1.06',
            cumulativeCapitalAfterAnnual: 22830,
          },
        ],
        finalization: {
          quarterUsed: 'Q2',
          indicesApplied: ['QUARTERLY.2054.Q4'],
          resultingCapital: 1200000,
        },
        base: {
          baseCapital: 1300000,
          components: {
            contributions: 1200000,
            initialCapital: 100000,
          },
        },
        life: {
          years: 20,
          lifeTableId: 'SDZ.M.2055',
        },
        pension: {
          monthlyPensionNominal: 5416.67,
          monthlyPensionRealToday: 4500.5,
          replacementRate: 0.9,
        },
        assumptions: {
          annualIndexSetId: 'DEMO_ANNUAL',
          quarterlyIndexSetId: 'DEMO_QUARTERLY',
          lifeTableId: 'SDZ.M.2055',
          cpiVintageId: 'DEMO_CPI',
          wageVintageId: 'DEMO_WAGE',
          contribRuleId: 'DEMO_CONTRIB',
          providerKind: 'DeterministicDemo',
        },
        explainers: ['Quarter mapping: claimMonth 6 → Q2', 'SDŻ table window: SDZ.M.2055'],
      };

      const result = buildOutput(params);

      expect(result.scenario).toEqual(params.scenario);
      expect(result.monthlyPensionNominal).toBe(params.pension.monthlyPensionNominal);
      expect(result.monthlyPensionRealToday).toBe(params.pension.monthlyPensionRealToday);
      expect(result.replacementRate).toBe(params.pension.replacementRate);
      expect(result.capitalTrajectory.length).toBe(params.annualTrajectory.length);
      expect(result.finalization).toBeDefined();
      expect(result.assumptions).toBeDefined();
      expect(result.explainers.length).toBeGreaterThan(0);
    });
  });

  describe('trajectory mapping', () => {
    it('should map annual trajectory to trajectory rows', () => {
      const annualTrajectory: AnnualValorizedState[] = [
        {
          year: 2010,
          contributionAdded: 10000,
          annualIndexAppliedId: 'ANNUAL.2010.1.05',
          cumulativeCapitalAfterAnnual: 10500,
        },
        {
          year: 2011,
          contributionAdded: 11000,
          annualIndexAppliedId: 'ANNUAL.2011.1.06',
          cumulativeCapitalAfterAnnual: 22830,
        },
      ];

      const params: BuildOutputParams = {
        scenario: {
          retirementAge: 65,
          retirementYear: 2055,
          claimMonth: 6,
          gender: 'M',
        },
        annualTrajectory,
        finalization: {
          quarterUsed: 'Q2',
          indicesApplied: ['QUARTERLY.2054.Q4'],
          resultingCapital: 1200000,
        },
        base: {
          baseCapital: 1200000,
          components: {
            contributions: 1200000,
            initialCapital: 0,
          },
        },
        life: {
          years: 20,
          lifeTableId: 'SDZ.M.2055',
        },
        pension: {
          monthlyPensionNominal: 5000,
          monthlyPensionRealToday: 4500,
          replacementRate: 0.9,
        },
        assumptions: {
          annualIndexSetId: 'DEMO_ANNUAL',
          quarterlyIndexSetId: 'DEMO_QUARTERLY',
          lifeTableId: 'SDZ.M.2055',
          cpiVintageId: 'DEMO_CPI',
          wageVintageId: 'DEMO_WAGE',
          contribRuleId: 'DEMO_CONTRIB',
          providerKind: 'DeterministicDemo',
        },
        explainers: ['Test explainer'],
      };

      const result = buildOutput(params);

      expect(result.capitalTrajectory.length).toBe(annualTrajectory.length);
      result.capitalTrajectory.forEach((row, idx) => {
        expect(row.year).toBe(annualTrajectory[idx].year);
        expect(row.annualContribution).toBe(annualTrajectory[idx].contributionAdded);
        expect(row.cumulativeCapitalAfterAnnual).toBe(
          annualTrajectory[idx].cumulativeCapitalAfterAnnual
        );
      });
    });
  });

  describe('finalization mapping', () => {
    it('should map finalization step to FinalizationVO', () => {
      const finalizationStep: FinalizationStep = {
        quarterUsed: 'Q3',
        indicesApplied: ['QUARTERLY.2054.Q1', 'QUARTERLY.2054.Q2'],
        resultingCapital: 1250000,
      };

      const params: BuildOutputParams = {
        scenario: {
          retirementAge: 65,
          retirementYear: 2055,
          claimMonth: 8,
          gender: 'M',
        },
        annualTrajectory: [],
        finalization: finalizationStep,
        base: {
          baseCapital: 1250000,
          components: {
            contributions: 1250000,
            initialCapital: 0,
          },
        },
        life: {
          years: 20,
          lifeTableId: 'SDZ.M.2055',
        },
        pension: {
          monthlyPensionNominal: 5208.33,
          monthlyPensionRealToday: 4500,
          replacementRate: 0.9,
        },
        assumptions: {
          annualIndexSetId: 'DEMO_ANNUAL',
          quarterlyIndexSetId: 'DEMO_QUARTERLY',
          lifeTableId: 'SDZ.M.2055',
          cpiVintageId: 'DEMO_CPI',
          wageVintageId: 'DEMO_WAGE',
          contribRuleId: 'DEMO_CONTRIB',
          providerKind: 'DeterministicDemo',
        },
        explainers: ['Test explainer'],
      };

      const result = buildOutput(params);

      expect(result.finalization.compoundedResult).toBe(finalizationStep.resultingCapital);
      expect(result.finalization.quarterIndexId).toContain('QUARTERLY');
    });
  });

  describe('assumptions mapping', () => {
    it('should map all assumptions correctly', () => {
      const assumptions = {
        annualIndexSetId: 'DEMO_ANNUAL',
        quarterlyIndexSetId: 'DEMO_QUARTERLY',
        lifeTableId: 'SDZ.M.2055',
        cpiVintageId: 'DEMO_CPI',
        wageVintageId: 'DEMO_WAGE',
        contribRuleId: 'DEMO_CONTRIB',
        providerKind: 'DeterministicDemo',
      };

      const params: BuildOutputParams = {
        scenario: {
          retirementAge: 65,
          retirementYear: 2055,
          claimMonth: 6,
          gender: 'M',
        },
        annualTrajectory: [],
        finalization: {
          quarterUsed: 'Q2',
          indicesApplied: ['QUARTERLY.2054.Q4'],
          resultingCapital: 1200000,
        },
        base: {
          baseCapital: 1200000,
          components: {
            contributions: 1200000,
            initialCapital: 0,
          },
        },
        life: {
          years: 20,
          lifeTableId: 'SDZ.M.2055',
        },
        pension: {
          monthlyPensionNominal: 5000,
          monthlyPensionRealToday: 4500,
          replacementRate: 0.9,
        },
        assumptions,
        explainers: ['Test explainer'],
      };

      const result = buildOutput(params);

      expect(result.assumptions).toEqual(assumptions);
    });
  });

  describe('invariants', () => {
    it('should preserve explainers', () => {
      const explainers = [
        'Quarter mapping: claimMonth 6 → Q2',
        'SDŻ table window: SDZ.M.2055',
        'Annual valorization precedes quarterly',
      ];

      const params: BuildOutputParams = {
        scenario: {
          retirementAge: 65,
          retirementYear: 2055,
          claimMonth: 6,
          gender: 'M',
        },
        annualTrajectory: [],
        finalization: {
          quarterUsed: 'Q2',
          indicesApplied: ['QUARTERLY.2054.Q4'],
          resultingCapital: 1200000,
        },
        base: {
          baseCapital: 1200000,
          components: {
            contributions: 1200000,
            initialCapital: 0,
          },
        },
        life: {
          years: 20,
          lifeTableId: 'SDZ.M.2055',
        },
        pension: {
          monthlyPensionNominal: 5000,
          monthlyPensionRealToday: 4500,
          replacementRate: 0.9,
        },
        assumptions: {
          annualIndexSetId: 'DEMO_ANNUAL',
          quarterlyIndexSetId: 'DEMO_QUARTERLY',
          lifeTableId: 'SDZ.M.2055',
          cpiVintageId: 'DEMO_CPI',
          wageVintageId: 'DEMO_WAGE',
          contribRuleId: 'DEMO_CONTRIB',
          providerKind: 'DeterministicDemo',
        },
        explainers,
      };

      const result = buildOutput(params);

      expect(result.explainers).toEqual(explainers);
      expect(result.explainers.length).toBe(explainers.length);
    });

    it('should maintain trajectory length', () => {
      const trajectoryLengths = [0, 1, 5, 10, 45];

      trajectoryLengths.forEach((length) => {
        const annualTrajectory: AnnualValorizedState[] = Array.from({ length }, (_, i) => ({
          year: 2010 + i,
          contributionAdded: 10000,
          annualIndexAppliedId: `ANNUAL.${2010 + i}`,
          cumulativeCapitalAfterAnnual: 10000 * (i + 1),
        }));

        const params: BuildOutputParams = {
          scenario: {
            retirementAge: 65,
            retirementYear: 2055,
            claimMonth: 6,
            gender: 'M',
          },
          annualTrajectory,
          finalization: {
            quarterUsed: 'Q2',
            indicesApplied: ['QUARTERLY.2054.Q4'],
            resultingCapital: 1200000,
          },
          base: {
            baseCapital: 1200000,
            components: {
              contributions: 1200000,
              initialCapital: 0,
            },
          },
          life: {
            years: 20,
            lifeTableId: 'SDZ.M.2055',
          },
          pension: {
            monthlyPensionNominal: 5000,
            monthlyPensionRealToday: 4500,
            replacementRate: 0.9,
          },
          assumptions: {
            annualIndexSetId: 'DEMO_ANNUAL',
            quarterlyIndexSetId: 'DEMO_QUARTERLY',
            lifeTableId: 'SDZ.M.2055',
            cpiVintageId: 'DEMO_CPI',
            wageVintageId: 'DEMO_WAGE',
            contribRuleId: 'DEMO_CONTRIB',
            providerKind: 'DeterministicDemo',
          },
          explainers: ['Test explainer'],
        };

        const result = buildOutput(params);

        expect(result.capitalTrajectory.length).toBe(length);
      });
    });
  });
});
