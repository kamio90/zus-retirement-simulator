/**
 * V2 API Client for ZUS Wizard
 * Handles communication with v2 wizard endpoints
 */
import type {
  WizardInitRequest,
  WizardInitResponse,
  WizardContractRequest,
  WizardContractResponse,
  WizardJdgRequest,
  ScenarioResult,
  CompareHigherZusRequest,
  CompareAsUopRequest,
  CompareWhatIfRequest,
  CompareWhatIfResponse,
  SimulateV2Request,
  SimulateV2Response,
  ApiError,
} from '@zus/types';

const V2_API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/v2`
  : '/v2';

export class V2ApiClientError extends Error {
  constructor(
    message: string,
    public apiError?: ApiError,
    public statusCode?: number,
    public correlationId?: string
  ) {
    super(message);
    this.name = 'V2ApiClientError';
  }
}

/**
 * Helper to make v2 API requests with correlation ID support
 */
async function v2Request<T>(
  endpoint: string,
  method: 'POST' | 'GET' = 'POST',
  body?: unknown,
  correlationId?: string
): Promise<T> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (correlationId) {
      headers['X-Correlation-Id'] = correlationId;
    }

    const response = await fetch(`${V2_API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseCorrelationId = response.headers.get('X-Correlation-Id');
    const contentType = response.headers.get('Content-Type') || '';

    // Get response text first
    const responseText = await response.text();

    // Try to parse JSON if response has content and proper content-type
    let responseData: unknown = null;
    if (responseText && contentType.includes('application/json')) {
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // JSON parse failed even with correct content-type
        throw new V2ApiClientError(
          'Invalid JSON response from server',
          undefined,
          response.status,
          responseCorrelationId || correlationId
        );
      }
    } else if (responseText) {
      // Non-JSON response
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      const errorMessage =
        (responseData as { message?: string })?.message ||
        (responseData as { raw?: string })?.raw ||
        'API request failed';
      throw new V2ApiClientError(
        errorMessage,
        responseData as ApiError | undefined,
        response.status,
        responseCorrelationId || correlationId
      );
    }

    return responseData as T;
  } catch (error) {
    if (error instanceof V2ApiClientError) {
      throw error;
    }
    throw new V2ApiClientError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      undefined,
      undefined,
      correlationId
    );
  }
}

/**
 * Step 1: Wizard Init (Gender & Age validation)
 */
export async function wizardInit(
  request: WizardInitRequest,
  correlationId?: string
): Promise<WizardInitResponse> {
  return v2Request<WizardInitResponse>('/wizard/init', 'POST', request, correlationId);
}

/**
 * Step 2: Contract Type validation
 */
export async function wizardContract(
  request: WizardContractRequest,
  correlationId?: string
): Promise<WizardContractResponse> {
  return v2Request<WizardContractResponse>('/wizard/contract', 'POST', request, correlationId);
}

/**
 * Step 3a: JDG Quick Result
 */
export async function wizardJdg(
  request: WizardJdgRequest,
  correlationId?: string
): Promise<ScenarioResult> {
  return v2Request<ScenarioResult>('/wizard/jdg', 'POST', request, correlationId);
}

/**
 * Compare: Higher ZUS
 */
export async function compareHigherZus(
  request: CompareHigherZusRequest,
  correlationId?: string
): Promise<ScenarioResult> {
  return v2Request<ScenarioResult>('/compare/higher-zus', 'POST', request, correlationId);
}

/**
 * Compare: As UoP
 */
export async function compareAsUop(
  request: CompareAsUopRequest,
  correlationId?: string
): Promise<ScenarioResult> {
  return v2Request<ScenarioResult>('/compare/as-uop', 'POST', request, correlationId);
}

/**
 * Compare: What-If scenarios
 */
export async function compareWhatIf(
  request: CompareWhatIfRequest,
  correlationId?: string
): Promise<CompareWhatIfResponse> {
  return v2Request<CompareWhatIfResponse>('/compare/what-if', 'POST', request, correlationId);
}

/**
 * Final Simulate
 */
export async function simulateV2(
  request: SimulateV2Request,
  correlationId?: string
): Promise<SimulateV2Response> {
  return v2Request<SimulateV2Response>('/simulate', 'POST', request, correlationId);
}
