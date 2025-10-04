import { Request, Response } from 'express';
import { telemetryService } from '../services/telemetryService';
import { TelemetryEvent } from '@zus/types';

/**
 * Convert telemetry events to JSONL format (one JSON per line)
 */
function eventsToJsonl(events: TelemetryEvent[]): string {
  return events.map(event => JSON.stringify(event)).join('\n');
}

/**
 * Convert telemetry events to CSV format
 */
function eventsToCsv(events: TelemetryEvent[]): string {
  if (events.length === 0) {
    return 'eventType,timestampISO,correlationId,userAgentHash,payloadLite\n';
  }

  const headers = ['eventType', 'timestampISO', 'correlationId', 'userAgentHash', 'payloadLite'];
  const csvRows = [headers.join(',')];

  for (const event of events) {
    const row = [
      event.eventType,
      event.timestampISO,
      event.correlationId,
      event.userAgentHash || '',
      event.payloadLite ? JSON.stringify(event.payloadLite) : ''
    ];
    
    // Escape CSV values
    const escapedRow = row.map(value => {
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    
    csvRows.push(escapedRow.join(','));
  }

  return csvRows.join('\n');
}

export const adminController = {
  /**
   * Export telemetry data in JSONL or CSV format
   */
  exportTelemetry: (req: Request, res: Response) => {
    try {
      const format = req.query.format as string || 'jsonl';
      const events = telemetryService.getAllEvents();

      if (format === 'csv') {
        const csv = eventsToCsv(events);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=telemetry.csv');
        res.send(csv);
      } else if (format === 'jsonl') {
        const jsonl = eventsToJsonl(events);
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Content-Disposition', 'attachment; filename=telemetry.jsonl');
        res.send(jsonl);
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid format. Use "jsonl" or "csv"'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to export telemetry data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  /**
   * Get telemetry statistics
   */
  getTelemetryStats: (req: Request, res: Response) => {
    try {
      const events = telemetryService.getAllEvents();
      const eventTypeCounts: Record<string, number> = {};

      for (const event of events) {
        eventTypeCounts[event.eventType] = (eventTypeCounts[event.eventType] || 0) + 1;
      }

      res.json({
        totalEvents: telemetryService.getEventsCount(),
        eventTypeCounts,
        oldestEvent: events.length > 0 ? events[0].timestampISO : null,
        newestEvent: events.length > 0 ? events[events.length - 1].timestampISO : null
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get telemetry stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};
