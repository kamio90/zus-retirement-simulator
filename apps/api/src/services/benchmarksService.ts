import { calculateBenchmarks, BenchmarksInput, BenchmarksResult } from '@zus/core';

export const benchmarksService = {
  getBenchmarks: (input: BenchmarksInput): BenchmarksResult => {
    return calculateBenchmarks(input);
  },
};
