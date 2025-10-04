# Content API Documentation

## Knowledge Endpoint

### `GET /content/knowledge`

Retrieve educational knowledge items with source attribution for the pension simulator.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `step` | string | - | Filter by step ID (e.g., `step2_contract`) |
| `lang` | string | `pl-PL` | Language code (`pl-PL` or `en-GB`) |
| `limit` | number | 3 | Maximum items to return (1-10) |

#### Response

**Success (200 OK)**

```json
{
  "version": "2025.10.0",
  "items": [
    {
      "id": "skladka-emerytalna",
      "step": "step2_contract",
      "title": "Składka emerytalna",
      "body": "Składka na ubezpieczenie emerytalne wynosi 19,52% podstawy wymiaru...",
      "source": {
        "title": "ZUS - Składki na ubezpieczenia",
        "url": "https://www.zus.pl/baza-wiedzy/skladki"
      },
      "lang": "pl-PL"
    }
  ]
}
```

**Error (404 Not Found)**

```json
{
  "code": "KNOWLEDGE_NOT_FOUND",
  "message": "Knowledge file not found for language: pl-PL"
}
```

#### Headers

**Response Headers**
- `Cache-Control: public, max-age=3600` - Content is cacheable for 1 hour
- `ETag: <hash>` - Entity tag for caching
- `Content-Type: application/json`

#### Examples

**Get Polish knowledge for step 2**

```bash
curl "http://localhost:4000/content/knowledge?step=step2_contract&lang=pl-PL"
```

**Get English knowledge (all steps, max 5 items)**

```bash
curl "http://localhost:4000/content/knowledge?lang=en-GB&limit=5"
```

**Get with ETag caching**

```bash
# First request
curl -v "http://localhost:4000/content/knowledge" 2>&1 | grep -i etag
# Returns: ETag: "abc123..."

# Second request with If-None-Match
curl -H "If-None-Match: abc123..." "http://localhost:4000/content/knowledge"
# Returns: 304 Not Modified (if content unchanged)
```

#### Step IDs

Available step identifiers for filtering:

- `step1_gender_age` - Gender and age selection
- `step2_contract` - Contract type (UoP vs JDG)
- `step3a_jdg` - JDG details (ryczałt)
- `step4a_result` - Results and valorization
- `refine_compare` - Career periods comparison

#### Supported Languages

- `pl-PL` - Polish (default)
- `en-GB` - English (fallback)

Language fallback: If requested language is not available, the API attempts to return `en-GB` content.

#### Content Sources

All knowledge items include official source attribution from:
- `zus.pl` - Social Insurance Institution
- `gov.pl` - Government portals
- `stat.gov.pl` - Central Statistical Office (GUS)
- `isap.sejm.gov.pl` - Legal references

#### Caching Strategy

- Content is cached for **1 hour** (3600 seconds)
- ETags are generated from content hash
- 304 Not Modified responses when content unchanged
- Client should implement ETag-based caching

#### Knowledge Item Structure

```typescript
interface KnowledgeItem {
  id: string;              // Unique identifier
  step?: string;           // Optional step filter
  title: string;           // Display title
  body: string;            // Educational content (≤300 chars)
  source: {
    title: string;         // Source name
    url: string;          // Official URL
  };
  lang: string;           // Language code
}
```

## v1 API Deprecation

### All `/v1/*` Routes

**Status: 410 Gone**

All v1 API endpoints have been deprecated and return HTTP 410 Gone.

#### Response

```json
{
  "code": "API_V1_DEPRECATED",
  "message": "API v1 is deprecated. Please migrate to /api/v2/*.",
  "migrateTo": "/api/v2/*"
}
```

#### Headers

- `Deprecation: version="1" date="2025-10-04"` - RFC 8594 deprecation header
- `Link: </api/v2>; rel="successor-version"` - Points to successor API

#### Migration

All v1 endpoints have v2 equivalents:

| v1 Endpoint | v2 Equivalent | Notes |
|-------------|---------------|-------|
| `/v1/simulate` | `/v2/wizard/init` | Use wizard flow |
| `/v1/calculate` | `/v2/simulate` | Direct calculation |

See [V2_API_DOCUMENTATION.md](./V2_API_DOCUMENTATION.md) for complete v2 API reference.

#### Logging

- First request from each IP is logged as `[WARN] API v1 deprecated request`
- Subsequent requests from same IP within 24h are not logged
- Logs include: path, IP (hashed), user-agent, `deprecated.v1=true` flag
