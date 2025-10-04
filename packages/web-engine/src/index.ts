/**
 * Web Engine - Frontend Pension Calculator (Placeholder)
 * 
 * This is a placeholder for future implementation.
 * When implemented, this will provide frontend-only calculation capability
 * as a fallback when the backend API is unavailable.
 * 
 * @package @zus/web-engine
 * @version 0.1.0-placeholder
 */

import type { WizardJdgRequest, ScenarioResult } from '@zus/types';

/**
 * Calculate pension scenario on the frontend (not implemented)
 * 
 * Future implementation will mirror the backend canonical algorithm:
 * - Annual valorization (June 1st, previous year index)
 * - Quarterly valorization (after last Jan 31)
 * - Initial capital 1999 × 1.1560
 * - SDŻ window (Apr 1 - Mar 31)
 * - CPI discount for real values
 * 
 * @param request - Pension calculation request
 * @returns Scenario result with engineProvider: 'frontend'
 * @throws Error - Not implemented yet
 */
export function calculatePension(request: WizardJdgRequest): ScenarioResult {
  // Placeholder - will be implemented in future iteration
  throw new Error('Frontend engine not yet implemented. Use backend API.');
}

/**
 * Check if frontend engine is available
 * @returns false (placeholder implementation)
 */
export function isFrontendEngineAvailable(): boolean {
  return false;
}
