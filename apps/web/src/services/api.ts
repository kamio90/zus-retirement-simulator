/**
 * API Client for ZUS Retirement Simulator
 * Handles communication with the backend API
 */
import type { SimulateRequest, SimulationResult, ApiError, ReportPayload } from '@zus/types';

const API_BASE_URL = '/api';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public apiError?: ApiError,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export interface BenchmarksResponse {
  nationalAvgPension: number;
  powiatAvgPension?: number;
  powiatResolved?: {
    name: string;
    teryt: string;
  };
  generatedAt: string;
}

/**
 * Simulate pension calculation
 * @param request Simulation input data
 * @returns Simulation result
 * @throws ApiClientError on validation or server errors
 */
export async function simulatePension(request: SimulateRequest): Promise<SimulationResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new ApiClientError(
        errorData.message || 'API request failed',
        errorData,
        response.status
      );
    }

    const result: SimulationResult = await response.json();
    return result;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

/**
 * Fetch benchmarks for comparison
 * @param powiatTeryt Optional TERYT code for regional benchmarks
 * @param gender Optional gender filter
 * @returns Benchmarks data
 */
export async function fetchBenchmarks(
  powiatTeryt?: string,
  gender?: 'M' | 'F'
): Promise<BenchmarksResponse> {
  try {
    const params = new URLSearchParams();
    if (powiatTeryt) params.append('powiatTeryt', powiatTeryt);
    if (gender) params.append('gender', gender);

    const response = await fetch(`${API_BASE_URL}/benchmarks?${params.toString()}`);

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new ApiClientError(
        errorData.message || 'Failed to fetch benchmarks',
        errorData,
        response.status
      );
    }

    const result: BenchmarksResponse = await response.json();
    return result;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

/**
 * Generate PDF report from simulation results
 * @param payload Report payload with input, result, and optional benchmarks
 * @returns PDF blob for download
 * @throws ApiClientError on validation or server errors
 */
export async function generatePdfReport(payload: ReportPayload): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new ApiClientError(
        errorData.message || 'PDF generation failed',
        errorData,
        response.status
      );
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

/**
 * Generate XLS report from simulation results
 * @param payload Report payload with input, result, and optional benchmarks
 * @returns XLS blob for download
 * @throws ApiClientError on validation or server errors
 */
export async function generateXlsReport(payload: ReportPayload): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/xls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new ApiClientError(
        errorData.message || 'XLS generation failed',
        errorData,
        response.status
      );
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}
