import { Request } from 'express';
import type { SimulateInput, SimulationResult } from '@types';

export type SimulateRequest = Request<{},{},SimulateInput>;
export type SimulateResponse = SimulationResult;
// Add more typed helpers as needed for other endpoints
