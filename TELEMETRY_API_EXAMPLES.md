# Telemetry & Admin Exports - API Examples

## Quick Start

### 1. Send Telemetry Event

**Request:**
```bash
POST http://localhost:4000/telemetry
Content-Type: application/json

{
  "eventType": "simulate_success",
  "timestampISO": "2025-10-04T18:00:00.000Z",
  "correlationId": "demo-session-1",
  "userAgentHash": "demo-hash",
  "payloadLite": {
    "retirementAge": 67,
    "workYears": 40
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Telemetry event recorded"
}
```

### 2. Get Statistics

**Request:**
```bash
GET http://localhost:4000/admin/telemetry/stats
```

**Response:**
```json
{
  "totalEvents": 2,
  "eventTypeCounts": {
    "simulate_success": 1,
    "download_pdf": 1
  },
  "oldestEvent": "2025-10-04T18:00:00.000Z",
  "newestEvent": "2025-10-04T18:00:05.000Z"
}
```

### 3. Export as JSONL

**Request:**
```bash
GET http://localhost:4000/admin/telemetry/export?format=jsonl
```

**Response Headers:**
```
Content-Type: application/x-ndjson
Content-Disposition: attachment; filename=telemetry.jsonl
```

**Response Body:**
```jsonl
{"eventType":"simulate_success","timestampISO":"2025-10-04T18:00:00.000Z","correlationId":"demo-session-1","userAgentHash":"demo-hash","payloadLite":{"retirementAge":67,"workYears":40}}
{"eventType":"download_pdf","timestampISO":"2025-10-04T18:00:05.000Z","correlationId":"demo-session-1","userAgentHash":"demo-hash","payloadLite":{}}
```

### 4. Export as CSV

**Request:**
```bash
GET http://localhost:4000/admin/telemetry/export?format=csv
```

**Response Headers:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename=telemetry.csv
```

**Response Body:**
```csv
eventType,timestampISO,correlationId,userAgentHash,payloadLite
simulate_success,2025-10-04T18:00:00.000Z,demo-session-1,demo-hash,"{""retirementAge"":67,""workYears"":40}"
download_pdf,2025-10-04T18:00:05.000Z,demo-session-1,demo-hash,
```

## All Supported Event Types

### 1. simulate_success
```json
{
  "eventType": "simulate_success",
  "timestampISO": "2025-10-04T18:00:00.000Z",
  "correlationId": "session-123",
  "userAgentHash": "hash-abc",
  "payloadLite": {
    "retirementAge": 67,
    "workYears": 40
  }
}
```

### 2. download_pdf
```json
{
  "eventType": "download_pdf",
  "timestampISO": "2025-10-04T18:00:00.000Z",
  "correlationId": "session-123",
  "userAgentHash": "hash-abc"
}
```

### 3. download_xls
```json
{
  "eventType": "download_xls",
  "timestampISO": "2025-10-04T18:00:00.000Z",
  "correlationId": "session-123",
  "userAgentHash": "hash-abc"
}
```

### 4. dashboard_open
```json
{
  "eventType": "dashboard_open",
  "timestampISO": "2025-10-04T18:00:00.000Z",
  "correlationId": "session-123",
  "userAgentHash": "hash-abc"
}
```

### 5. form_validation_failed
```json
{
  "eventType": "form_validation_failed",
  "timestampISO": "2025-10-04T18:00:00.000Z",
  "correlationId": "session-123",
  "userAgentHash": "hash-abc",
  "payloadLite": {
    "fieldErrors": ["birthYear", "salary"]
  }
}
```

## Error Handling

### Invalid Event Format
**Request:**
```json
{
  "invalid": "event"
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Invalid telemetry event format",
  "error": "..."
}
```

### Invalid Export Format
**Request:**
```bash
GET /admin/telemetry/export?format=xml
```

**Response (400):**
```json
{
  "success": false,
  "message": "Invalid format. Use \"jsonl\" or \"csv\""
}
```

## Testing with cURL

```bash
# Send a simulate_success event
curl -X POST http://localhost:4000/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "simulate_success",
    "timestampISO": "2025-10-04T18:00:00.000Z",
    "correlationId": "test-session",
    "userAgentHash": "test-hash",
    "payloadLite": {"retirementAge": 67, "workYears": 40}
  }'

# Get statistics
curl http://localhost:4000/admin/telemetry/stats

# Export as JSONL
curl http://localhost:4000/admin/telemetry/export?format=jsonl

# Export as CSV
curl http://localhost:4000/admin/telemetry/export?format=csv
```

## Integration Notes

### Frontend Integration
To integrate with the frontend, create a telemetry service:

```typescript
// apps/web/src/services/telemetry.ts
import { TelemetryEvent } from '@zus/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function sendTelemetryEvent(event: Omit<TelemetryEvent, 'timestampISO' | 'correlationId'>): Promise<void> {
  try {
    const fullEvent: TelemetryEvent = {
      ...event,
      timestampISO: new Date().toISOString(),
      correlationId: sessionStorage.getItem('sessionId') || crypto.randomUUID(),
    };

    await fetch(`${API_BASE}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullEvent),
    });
  } catch (error) {
    // Silently fail - don't break app for telemetry
    console.warn('Telemetry error:', error);
  }
}

// Usage in components
sendTelemetryEvent({
  eventType: 'simulate_success',
  userAgentHash: hashUserAgent(navigator.userAgent),
  payloadLite: { retirementAge: 67, workYears: 40 },
});
```

## Privacy & Security

### What We Collect
- ✅ Event type (simulate_success, download_pdf, etc.)
- ✅ Timestamp (ISO 8601 format)
- ✅ Session correlation ID (for session tracking)
- ✅ Hashed user agent (for device type analytics)
- ✅ Minimal payload data (retirement age, work years, etc.)

### What We DON'T Collect
- ❌ Personal identifiable information (PII)
- ❌ IP addresses
- ❌ Email addresses
- ❌ Names
- ❌ Actual salaries or financial data
- ❌ Browser fingerprints

### Data Retention
- Mock implementation: Last 10,000 events in memory
- Production: Configure based on GDPR/privacy requirements

### Admin Access
- Current: No authentication (demo/development)
- Production: Add authentication middleware to `/admin/*` routes

## Performance

### In-Memory Storage Limits
- Maximum 10,000 events stored
- Automatic cleanup of oldest events when limit reached
- No disk I/O overhead

### Export Performance
- JSONL: Streaming-friendly, low memory
- CSV: Optimized for Excel/spreadsheet imports
- Both formats support large datasets efficiently

## Future Enhancements

1. **Persistent Storage**: PostgreSQL, MongoDB, or ClickHouse
2. **Authentication**: JWT or API key for admin endpoints
3. **Real-time Dashboard**: WebSocket updates for live analytics
4. **Aggregation**: Pre-computed metrics for faster queries
5. **Data Retention Policies**: Automatic cleanup based on age
6. **Export Filters**: Date range, event type filtering
7. **Batch Import**: Bulk event import for testing/migration
