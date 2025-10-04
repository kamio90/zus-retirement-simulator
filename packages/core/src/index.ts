// Export barrel for engine and provider interfaces
// -----------------------------------------------
export * from './contracts';
export * from './providers';
export { makeDemoProviderBundle } from './providers-impl/demo/demo-bundle';
import { Engine as EngineImpl } from './engine/engine';
export { Engine } from './engine/engine';

// Placeholder function until full implementation
export function buildEngineWithDemoProviders(): typeof EngineImpl {
  return EngineImpl;
}
