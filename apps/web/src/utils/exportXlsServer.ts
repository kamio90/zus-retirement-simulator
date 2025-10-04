/**
 * Server-side XLS Export Utility
 * Exports simulation results to XLS via API
 */
import type { SimulationResult, SimulateRequest } from '@zus/types';
import { generateXlsReport } from '../services/api';

/**
 * Export simulation results to XLS using server-side generation
 * @param result Simulation result
 * @param input Original simulation input
 */
export async function exportToXlsServer(
  result: SimulationResult,
  input: SimulateRequest
): Promise<void> {
  // Prepare payload
  const payload = {
    input,
    result,
    branding: {
      appName: 'ZUS Retirement Simulator',
      primaryHex: '#007a33',
    },
  };

  // Call API to generate XLS
  const blob = await generateXlsReport(payload);

  // Download XLS
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const timestamp = new Date().toISOString().slice(0, 10);
  link.download = `emerytura-symulacja-${timestamp}.xlsx`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}
