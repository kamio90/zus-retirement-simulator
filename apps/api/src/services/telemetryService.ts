import { TelemetryEvent } from '@zus/types';

/**
 * Mock in-memory telemetry storage (privacy-safe)
 * In production, this would be replaced with a proper database or analytics service
 */
class TelemetryStore {
  private events: TelemetryEvent[] = [];
  private readonly maxEvents = 10000; // Limit to prevent memory issues

  /**
   * Store a telemetry event
   */
  store(event: TelemetryEvent): void {
    this.events.push(event);

    // Keep only the last maxEvents to prevent memory overflow
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  /**
   * Get all stored events
   */
  getAll(): TelemetryEvent[] {
    return [...this.events];
  }

  /**
   * Get events count
   */
  getCount(): number {
    return this.events.length;
  }

  /**
   * Clear all events (for testing)
   */
  clear(): void {
    this.events = [];
  }
}

const telemetryStore = new TelemetryStore();

export const telemetryService = {
  /**
   * Store a telemetry event
   */
  sendTelemetry: (event: TelemetryEvent): void => {
    telemetryStore.store(event);
  },

  /**
   * Get all telemetry events
   */
  getAllEvents: (): TelemetryEvent[] => {
    return telemetryStore.getAll();
  },

  /**
   * Get events count
   */
  getEventsCount: (): number => {
    return telemetryStore.getCount();
  },

  /**
   * Clear all events
   */
  clearEvents: (): void => {
    telemetryStore.clear();
  },
};
