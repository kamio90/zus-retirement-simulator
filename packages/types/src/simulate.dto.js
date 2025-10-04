"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulateInputSchema = void 0;
const zod_1 = require("zod");
exports.SimulateInputSchema = zod_1.z.object({
    birthYear: zod_1.z.number().int().min(1940).max(new Date().getFullYear() - 16),
    gender: zod_1.z.enum(['male', 'female']),
    startWorkYear: zod_1.z.number().int().min(1950).max(new Date().getFullYear()),
    retirementAge: zod_1.z.number().int().min(60).max(70).optional(),
    salary: zod_1.z.number().min(1000).max(100000),
    absenceFactor: zod_1.z.number().min(0.7).max(1.0).default(0.97),
    powiat: zod_1.z.string().length(7).optional(), // TERYT code
    accumulatedCapital: zod_1.z.number().min(0).optional(),
}).transform((data) => {
    // Apply default retirementAge based on gender if not provided
    if (data.retirementAge === undefined) {
        data.retirementAge = data.gender === 'female' ? 60 : 65;
    }
    return data;
});
