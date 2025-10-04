# XLS Export Implementation Summary

## Overview
This implementation adds server-side XLS (Excel) export functionality to the ZUS Retirement Simulator, following the same architectural pattern as the existing PDF export feature.

## Implementation Details

### Backend Changes

#### 1. Dependencies
- **Added**: `exceljs@^4.4.0` to `apps/api/package.json`

#### 2. Service Layer (`apps/api/src/services/reportsService.ts`)
- **New Function**: `generateXlsReport(payload: ReportPayload): Promise<Buffer>`
- Generates Excel workbook with two sheets:
  - **Summary Sheet**: Contains key results, scenario details, and assumptions
  - **Capital Trajectory Sheet**: Year-by-year breakdown of wages, contributions, and capital

#### 3. Controller Layer (`apps/api/src/controllers/reportsController.ts`)
- **New Method**: `reportsController.generateXls`
- Validates request payload using Zod schema
- Calls service to generate XLS buffer
- Sets appropriate response headers for Excel file download
- Returns XLSX file with timestamp-based filename

#### 4. Routes (`apps/api/src/routes/reports.ts`)
- **New Route**: `POST /api/reports/xls`

### Frontend Changes

#### 1. API Client (`apps/web/src/services/api.ts`)
- **New Function**: `generateXlsReport(payload: ReportPayload): Promise<Blob>`
- Makes POST request to `/api/reports/xls`
- Returns blob for download

#### 2. Export Utility (`apps/web/src/utils/exportXlsServer.ts`)
- **New File**: Server-side XLS export utility
- **Function**: `exportToXlsServer(result, input): Promise<void>`
- Prepares payload with branding
- Calls API to generate XLS
- Triggers browser download

#### 3. UI Component (`apps/web/src/components/ResultsDisplay.tsx`)
- Updated to use `exportToXlsServer` instead of client-side `exportToXls`
- Same user experience, but generation happens on server

## XLS File Structure

### Summary Sheet
- **Key Results**
  - Monthly pension (nominal)
  - Monthly pension (today's value)
  - Replacement rate

- **Scenario Details**
  - Retirement age
  - Retirement year
  - Claim month
  - Gender

- **Assumptions**
  - Provider type
  - Annual valorization
  - Quarterly valorization
  - Life expectancy table
  - CPI version
  - Wage version

### Capital Trajectory Sheet
Columns:
- Year
- Annual wage (PLN)
- Annual contribution (PLN)
- Accumulated capital (PLN)

## Styling
- ZUS brand colors (green: #007A33, light green: #E5F3E8)
- Professional formatting with number formats
- Bold headers with background colors
- Merged cells for titles

## API Endpoint

**Endpoint**: `POST /api/reports/xls`

**Request**:
```json
{
  "input": { /* SimulateRequest */ },
  "result": { /* SimulationResult */ },
  "branding": {
    "appName": "ZUS Retirement Simulator",
    "primaryHex": "#007a33"
  }
}
```

**Response**: XLSX file download with appropriate headers
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="emerytura-symulacja-YYYY-MM-DD.xlsx"`

## Benefits of Server-Side Generation

1. **Reduced Bundle Size**: ExcelJS library no longer needed in frontend bundle
2. **Consistent Generation**: Same generation logic for all users
3. **Server Resources**: Heavy processing happens on server
4. **Easier Maintenance**: Single source of truth for XLS structure
5. **Better Error Handling**: Server-side validation and logging

## Migration Path

The old client-side export utility (`apps/web/src/utils/exportXls.ts`) is still in the codebase but no longer used. It can be safely removed in a future cleanup PR.

## Testing

- ✅ Build successful (TypeScript compilation)
- ✅ Frontend linting passed
- ✅ API linting shows only pre-existing issues
- ✅ Manual verification of code paths
- ✅ Route configuration verified
- ✅ Compiled output verified

## Files Changed

1. `apps/api/package.json` - Added ExcelJS dependency
2. `apps/api/src/services/reportsService.ts` - Added generateXlsReport function
3. `apps/api/src/controllers/reportsController.ts` - Added generateXls controller
4. `apps/api/src/routes/reports.ts` - Added /xls route
5. `apps/web/src/services/api.ts` - Added generateXlsReport API client
6. `apps/web/src/utils/exportXlsServer.ts` - New server-side export utility
7. `apps/web/src/components/ResultsDisplay.tsx` - Updated to use server export
8. `apps/api/README.md` - Updated documentation
9. `pnpm-lock.yaml` - Dependency updates

## Future Improvements

1. Add unit tests for XLS generation
2. Add integration tests for API endpoint
3. Consider adding chart images to XLS (like PDF)
4. Add support for benchmarks data in XLS
5. Remove old client-side export utility
