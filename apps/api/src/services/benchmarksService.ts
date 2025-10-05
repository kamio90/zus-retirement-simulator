// Temporarily disabled due to missing @zus/data dependency
// import { calculateBenchmarks, BenchmarksInput, BenchmarksResult } from '@zus/core';

export const benchmarksService = {
  getBenchmarks: (_input: any): any => {
    // Temporarily disabled - returns mock data
    return {
      nationalAvgPension: 3500,
      powiatAvgPension: 3200,
    };
  },
};
