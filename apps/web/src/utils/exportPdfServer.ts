/**
 * Server-side PDF Export Utility
 * Exports simulation results to PDF via API
 */
import type { SimulationResult, SimulateRequest } from '@zus/types';
import { generatePdfReport } from '../services/api';

/**
 * Export simulation results to PDF using server-side generation
 * @param result Simulation result
 * @param input Original simulation input
 */
export async function exportToPdfServer(
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

  // Call API to generate PDF
  const blob = await generatePdfReport(payload);

  // Download PDF
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const timestamp = new Date().toISOString().slice(0, 10);
  link.download = `emerytura-symulacja-${timestamp}.pdf`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}
