/**
 * Scenarios Controller - Scenario Engine v2 endpoints
 * Handles JDG quick calc, career composition, and comparisons
 */
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  JdgQuickRequestSchema,
  ComposeCareerRequestSchema,
  ComparisonRequestSchema,
  ApiError,
  ERROR_HTTP_MAPPING,
} from '@zus/types';
import {
  calculateJdgQuick,
  composeCareer,
  compareScenarios,
} from '../services/scenariosService';

export const scenariosController = {
  /**
   * POST /api/scenarios/jdg-quick
   * Quick JDG pension preview for wizard step 3→4
   */
  jdgQuick: (req: Request, res: Response): void => {
    const correlationId = req.headers['x-correlation-id']?.toString() || uuidv4();

    try {
      const validatedRequest = JdgQuickRequestSchema.parse(req.body);
      const result = calculateJdgQuick(validatedRequest);

      res.setHeader('X-Correlation-Id', correlationId);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const apiError: ApiError = {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          details: {
            issues: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          correlationId,
          hint: 'Check birthYear, gender, age, monthlyIncome, and isRyczalt fields',
        };
        res.status(ERROR_HTTP_MAPPING.VALIDATION_ERROR).json(apiError);
        return;
      }

      const apiError: ApiError = {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        correlationId,
      };
      res.status(ERROR_HTTP_MAPPING.INTERNAL_ERROR).json(apiError);
    }
  },

  /**
   * POST /api/scenarios/compose
   * Multi-period career composition for wizard step 5
   */
  compose: (req: Request, res: Response): void => {
    const correlationId = req.headers['x-correlation-id']?.toString() || uuidv4();

    try {
      const validatedRequest = ComposeCareerRequestSchema.parse(req.body);
      const result = composeCareer(validatedRequest);

      res.setHeader('X-Correlation-Id', correlationId);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const apiError: ApiError = {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          details: {
            issues: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          correlationId,
          hint: 'Check birthYear, gender, and careerPeriods fields',
        };
        res.status(ERROR_HTTP_MAPPING.VALIDATION_ERROR).json(apiError);
        return;
      }

      const apiError: ApiError = {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        correlationId,
      };
      res.status(ERROR_HTTP_MAPPING.INTERNAL_ERROR).json(apiError);
    }
  },

  /**
   * POST /api/scenarios/compare
   * Scenario comparison (UoP vs JDG, higher ZUS, delayed retirement)
   */
  compare: (req: Request, res: Response): void => {
    const correlationId = req.headers['x-correlation-id']?.toString() || uuidv4();

    try {
      const validatedRequest = ComparisonRequestSchema.parse(req.body);
      const result = compareScenarios(validatedRequest);

      res.setHeader('X-Correlation-Id', correlationId);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const apiError: ApiError = {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          details: {
            issues: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          correlationId,
          hint: 'Check baseScenario, comparisonType, and comparisonParams fields',
        };
        res.status(ERROR_HTTP_MAPPING.VALIDATION_ERROR).json(apiError);
        return;
      }

      const apiError: ApiError = {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        correlationId,
      };
      res.status(ERROR_HTTP_MAPPING.INTERNAL_ERROR).json(apiError);
    }
  },
};
