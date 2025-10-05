// Export barrel for engine and provider interfaces
// -----------------------------------------------
export * from './contracts';
export * from './providers';
export { makeDemoProviderBundle } from './providers-impl/demo/demo-bundle';
export { Engine, buildEngineWithDemoProviders } from './engine/engine';
// Benchmarks temporarily disabled due to missing @zus/data dependency
// export * from './benchmarks';
