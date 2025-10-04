import { Request } from 'express';
import { SimulateInput, SimulationResult } from '@types/simulation';

export type SimulateRequest = Request<{},{},SimulateInput>;
export type SimulateResponse = SimulationResult;
// Add more typed helpers as needed for other endpoints
