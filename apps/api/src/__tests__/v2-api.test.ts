/**
 * V2 API Integration Tests
 * Tests for wizard and compare endpoints
 */
import request from 'supertest';
import express from 'express';
import { json } from 'body-parser';
import v2Router from '../routes/v2';

const app = express();
app.use(json());
app.use('/v2', v2Router);

describe('V2 Wizard API', () => {
  describe('POST /v2/wizard/init', () => {
    it('should accept valid gender and age', async () => {
      const response = await request(app)
        .post('/v2/wizard/init')
        .send({ gender: 'M', age: 35 })
        .expect(200);

      expect(response.body).toEqual({ ok: true });
    });

    it('should reject invalid age', async () => {
      const response = await request(app)
        .post('/v2/wizard/init')
        .send({ gender: 'M', age: 150 })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid gender', async () => {
      const response = await request(app)
        .post('/v2/wizard/init')
        .send({ gender: 'X', age: 35 })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /v2/wizard/contract', () => {
    it('should accept valid contract type', async () => {
      const response = await request(app)
        .post('/v2/wizard/contract')
        .send({ contract: 'JDG' })
        .expect(200);

      expect(response.body).toEqual({ ok: true });
    });

    it('should reject invalid contract type', async () => {
      const response = await request(app)
        .post('/v2/wizard/contract')
        .send({ contract: 'INVALID' })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /v2/wizard/jdg', () => {
    it('should return ScenarioResult with correct structure', async () => {
      const response = await request(app)
        .post('/v2/wizard/jdg')
        .send({
          gender: 'M',
          age: 35,
          contract: 'JDG',
          monthlyIncome: 12000,
          isRyczalt: false,
          claimMonth: 6,
        })
        .expect(200);

      expect(response.body).toHaveProperty('kpi');
      expect(response.body).toHaveProperty('capitalTrajectory');
      expect(response.body).toHaveProperty('assumptions');
      expect(response.body).toHaveProperty('explainers');

      expect(response.body.kpi).toHaveProperty('monthlyNominal');
      expect(response.body.kpi).toHaveProperty('monthlyRealToday');
      expect(response.body.kpi).toHaveProperty('replacementRate');
      expect(response.body.kpi).toHaveProperty('retirementYear');
      expect(response.body.kpi).toHaveProperty('claimQuarter');

      expect(response.body.kpi.claimQuarter).toBe('Q2');
    });

    it('should map claim month to correct quarter', async () => {
      // Test all quarters
      const testCases = [
        { claimMonth: 2, expectedQuarter: 'Q1' },
        { claimMonth: 5, expectedQuarter: 'Q2' },
        { claimMonth: 8, expectedQuarter: 'Q3' },
        { claimMonth: 11, expectedQuarter: 'Q4' },
      ];

      for (const { claimMonth, expectedQuarter } of testCases) {
        const response = await request(app)
          .post('/v2/wizard/jdg')
          .send({
            gender: 'M',
            age: 35,
            contract: 'JDG',
            monthlyIncome: 12000,
            isRyczalt: false,
            claimMonth,
          })
          .expect(200);

        expect(response.body.kpi.claimQuarter).toBe(expectedQuarter);
      }
    });

    it('should return real pension less than or equal to nominal under inflation', async () => {
      const response = await request(app)
        .post('/v2/wizard/jdg')
        .send({
          gender: 'M',
          age: 35,
          contract: 'JDG',
          monthlyIncome: 12000,
          isRyczalt: false,
          claimMonth: 6,
        })
        .expect(200);

      expect(response.body.kpi.monthlyRealToday).toBeLessThanOrEqual(
        response.body.kpi.monthlyNominal
      );
    });

    it('should have deterministic assumptions IDs', async () => {
      const response = await request(app)
        .post('/v2/wizard/jdg')
        .send({
          gender: 'M',
          age: 35,
          contract: 'JDG',
          monthlyIncome: 12000,
          isRyczalt: false,
          claimMonth: 6,
        })
        .expect(200);

      expect(response.body.assumptions.providerKind).toBe('DeterministicDemo');
      expect(response.body.assumptions.annualIndexSetId).toBeTruthy();
      expect(response.body.assumptions.quarterlyIndexSetId).toBeTruthy();
      expect(response.body.assumptions.lifeTableId).toBeTruthy();
      expect(response.body.assumptions.cpiVintageId).toBeTruthy();
      expect(response.body.assumptions.wageVintageId).toBeTruthy();
      expect(response.body.assumptions.contribRuleId).toBeTruthy();
    });
  });

  describe('POST /v2/compare/higher-zus', () => {
    it('should return higher pension with higher multiplier', async () => {
      const baselineResponse = await request(app)
        .post('/v2/wizard/jdg')
        .send({
          gender: 'M',
          age: 35,
          contract: 'JDG',
          monthlyIncome: 12000,
          isRyczalt: false,
          claimMonth: 6,
        });

      const comparisonResponse = await request(app)
        .post('/v2/compare/higher-zus')
        .send({
          gender: 'M',
          age: 35,
          contract: 'JDG',
          monthlyIncome: 12000,
          isRyczalt: false,
          claimMonth: 6,
          zusMultiplier: 1.5,
        })
        .expect(200);

      expect(comparisonResponse.body.kpi.monthlyNominal).toBeGreaterThan(
        baselineResponse.body.kpi.monthlyNominal
      );
    });
  });

  describe('POST /v2/compare/as-uop', () => {
    it('should calculate as UoP contract', async () => {
      const response = await request(app)
        .post('/v2/compare/as-uop')
        .send({
          gender: 'M',
          age: 35,
          contract: 'JDG',
          monthlyIncome: 12000,
          isRyczalt: false,
          claimMonth: 6,
        })
        .expect(200);

      expect(response.body).toHaveProperty('kpi');
      expect(response.body.kpi).toHaveProperty('monthlyNominal');
    });
  });

  describe('POST /v2/simulate', () => {
    it('should return baseline and variants', async () => {
      const response = await request(app)
        .post('/v2/simulate')
        .send({
          baselineContext: {
            gender: 'M',
            age: 35,
            contract: 'JDG',
            monthlyIncome: 12000,
            isRyczalt: false,
            claimMonth: 6,
          },
          variants: [
            { kind: 'contribution_boost', monthly: 1000 },
            { kind: 'delay_retirement', years: 2 },
          ],
        })
        .expect(200);

      expect(response.body).toHaveProperty('baselineResult');
      expect(response.body).toHaveProperty('variants');
      expect(response.body.variants).toHaveLength(2);
    });

    it('should work without variants', async () => {
      const response = await request(app)
        .post('/v2/simulate')
        .send({
          baselineContext: {
            gender: 'M',
            age: 35,
            contract: 'JDG',
            monthlyIncome: 12000,
            isRyczalt: false,
            claimMonth: 6,
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('baselineResult');
      expect(response.body.variants).toBeUndefined();
    });
  });

  describe('Monotonicity property', () => {
    it('higher monthly income should yield higher pension', async () => {
      const lowIncomeResponse = await request(app)
        .post('/v2/wizard/jdg')
        .send({
          gender: 'M',
          age: 35,
          contract: 'JDG',
          monthlyIncome: 8000,
          isRyczalt: false,
          claimMonth: 6,
        });

      const highIncomeResponse = await request(app)
        .post('/v2/wizard/jdg')
        .send({
          gender: 'M',
          age: 35,
          contract: 'JDG',
          monthlyIncome: 12000,
          isRyczalt: false,
          claimMonth: 6,
        });

      expect(highIncomeResponse.body.kpi.monthlyNominal).toBeGreaterThan(
        lowIncomeResponse.body.kpi.monthlyNominal
      );
      expect(highIncomeResponse.body.kpi.monthlyRealToday).toBeGreaterThan(
        lowIncomeResponse.body.kpi.monthlyRealToday
      );
    });
  });
});
