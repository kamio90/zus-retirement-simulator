/**
 * V2 Wizard Controller - Step-by-step wizard endpoints
 * Handles init, contract, jdg, compare, and simulate endpoints
 */
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  WizardInitRequestSchema,
  WizardContractRequestSchema,
  WizardJdgRequestSchema,
  CompareHigherZusRequestSchema,
  CompareAsUopRequestSchema,
  CompareWhatIfRequestSchema,
  SimulateV2RequestSchema,
  ApiError,
  ERROR_HTTP_MAPPING,
} from '@zus/types';
import {
  wizardInit,
  wizardContract,
  wizardJdg,
  compareHigherZus,
  compareAsUop,
  compareWhatIf,
  simulateV2,
} from '../services/v2WizardService';

/**
 * Helper to set standard headers for all responses
 */
function setStandardHeaders(res: Response, correlationId: string): void {
}

export const v2WizardController = {
  /**
   * POST /api/v2/wizard/init
   * Step 1: Gender & Age (stateless validation)
   */
  init: (req: Request, res: Response): void => {
    const correlationId = req.headers['x-correlation-id']?.toString() || uuidv4();
    setStandardHeaders(res, correlationId);

    try {
      const validatedRequest = WizardInitRequestSchema.parse(req.body);
      const result = wizardInit(validatedRequest);

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
          hint: 'Check gender (M/F) and age (18-100) fields',
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
   * POST /api/v2/wizard/contract
   * Step 2: Contract Type (stateless validation)
   */
  contract: (req: Request, res: Response): void => {
    const correlationId = req.headers['x-correlation-id']?.toString() || uuidv4();
    setStandardHeaders(res, correlationId);

    try {
      const validatedRequest = WizardContractRequestSchema.parse(req.body);
      const result = wizardContract(validatedRequest);

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
          hint: 'Check contract field (UOP, JDG, or JDG_RYCZALT)',
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
   * POST /api/v2/wizard/jdg
   * Step 3a: JDG Quick Result
   */
  jdg: (req: Request, res: Response): void => {
    const correlationId = req.headers['x-correlation-id']?.toString() || uuidv4();
    setStandardHeaders(res, correlationId);

    try {
      const validatedRequest = WizardJdgRequestSchema.parse(req.body);
      const result = wizardJdg(validatedRequest);

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
          hint: 'Check all required fields: gender, age, contract, monthlyIncome, isRyczalt',
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
   * POST /api/v2/compare/higher-zus
   * Compare with higher ZUS contribution base
   */
  higherZus: (req: Request, res: Response): void => {
    const correlationId = req.headers['x-correlation-id']?.toString() || uuidv4();
    setStandardHeaders(res, correlationId);

    try {
      const validatedRequest = CompareHigherZusRequestSchema.parse(req.body);
      const result = compareHigherZus(validatedRequest);

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
          hint: 'Check zusMultiplier (1-3) and other baseline fields',
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
   * POST /api/v2/compare/as-uop
   * Compare as UoP contract
   */
  asUop: (req: Request, res: Response): void => {
    const correlationId = req.headers['x-correlation-id']?.toString() || uuidv4();
    setStandardHeaders(res, correlationId);

    try {
      const validatedRequest = CompareAsUopRequestSchema.parse(req.body);
      const result = compareAsUop(validatedRequest);

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
          hint: 'Check baseline context fields',
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
   * POST /api/v2/compare/what-if
   * Compare with refinement scenarios
   */
  whatIf: (req: Request, res: Response): void => {
    const correlationId = req.headers['x-correlation-id']?.toString() || uuidv4();
    setStandardHeaders(res, correlationId);

    try {
      const validatedRequest = CompareWhatIfRequestSchema.parse(req.body);
      const result = compareWhatIf(validatedRequest);

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
          hint: 'Check baselineContext and items (1-5 refinement items)',
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
   * POST /api/v2/simulate
   * Final comprehensive simulation
   */
  simulate: (req: Request, res: Response): void => {
    const correlationId = req.headers['x-correlation-id']?.toString() || uuidv4();
    setStandardHeaders(res, correlationId);

    try {
      const validatedRequest = SimulateV2RequestSchema.parse(req.body);
      const result = simulateV2(validatedRequest);

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
          hint: 'Check baselineContext and optional variants array',
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
