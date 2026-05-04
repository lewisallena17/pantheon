# Metrics Logger — Word Count Tracking for Consecutive Queries

## Overview

The `metricsLogger` utility tracks response word counts across consecutive queries and writes aggregated statistics to `public/metrics.json` with atomic write guarantees.

**Purpose**: Monitor response content volume and measure text output patterns in API responses.

**Key Features**:
- ✅ Word count tracking for individual responses
- ✅ Automatic batch aggregation (min/max/avg/total)
- ✅ Atomic writes to `public/metrics.json` with validation
- ✅ Fire-and-forget async logging (non-blocking)
- ✅ Auto-flush on batch completion (5 responses by default)
- ✅ TypeScript support with full type definitions

## Installation

The metrics logger is already included in the project. No additional packages needed.

```typescript
import { metricsLogger, logResponseAndMaybeFlush } from '@/lib/metrics-logger'
```

## Quick Start

### Basic Usage

```typescript
import { metricsLogger } from '@/lib/metrics-logger'

// Initialize a batch (do this once at app startup)
metricsLogger.initBatch()

// Log a response
metricsLogger.addResponseWordCount("Some response text...", {
  route: '/api/todos',
  method: 'GET',
  status: 200,
})

// Check if batch is complete
if (metricsLogger.getResponseCount() === 5) {
  await metricsLogger.writeToMetricsJson()
  metricsLogger.reset()
}
```

### Using Auto-Flush Wrapper

```typescript
import { logResponseAndMaybeFlush } from '@/lib/metrics-logger'

// Automatically logs and flushes when 5 responses accumulated
await logResponseAndMaybeFlush(responseText, {
  route: '/api/todos',
  method: 'GET',
  status: 200,
  autoFlush: 5, // optional, defaults to 5
})
```

## API Reference

### `metricsLogger` (Global Singleton)

#### `initBatch(): void`
Initialize a new metrics batch with a unique batch ID.

```typescript
metricsLogger.initBatch()
```

#### `addResponseWordCount(responseText: string, options?: ResponseOptions): void`
Add a response and count its words. Updates min/max/avg statistics automatically.

```typescript
metricsLogger.addResponseWordCount("Hello world", {
  route: '/api/example',
  method: 'GET',
  status: 200,
})
```

**Parameters**:
- `responseText` (string): The response text to analyze
- `options` (optional):
  - `route`: API route path
  - `method`: HTTP method (GET, POST, etc.)
  - `status`: HTTP status code

#### `getResponseCount(): number`
Get the number of responses currently tracked in the batch.

```typescript
const count = metricsLogger.getResponseCount()
// Returns: 0-5+ depending on logged responses
```

#### `getResponses(): ResponseWordCountEntry[]`
Get all tracked responses in the current batch.

```typescript
const responses = metricsLogger.getResponses()
// Returns array of { wordCount, route, method, status, timestamp }
```

#### `async writeToMetricsJson(): Promise<void>`
Write the current batch metrics to `public/metrics.json` using atomic write.

```typescript
await metricsLogger.writeToMetricsJson()
// Appends batch to metrics.json with hash validation
```

#### `reset(): void`
Clear the current batch responses (keeps batch ID).

```typescript
metricsLogger.reset()
```

#### `resetAll(): void`
Clear everything including batch ID.

```typescript
metricsLogger.resetAll()
```

#### `toJSON(): MetricsData`
Get JSON representation without writing to file.

```typescript
const metrics = metricsLogger.toJSON()
// Returns: { timestamp, batchId, queryCount, responses, stats }
```

#### `formatLog(): string`
Get a formatted log message for debugging.

```typescript
console.log(metricsLogger.formatLog())
// Output: [metrics] responses=3 min=5 max=42 avg=18.33 total=55
```

### `logResponseAndMaybeFlush()` (Convenience Function)

Wrapper that automatically handles init, logging, and flushing.

```typescript
async function logResponseAndMaybeFlush(
  responseText: string,
  options?: ResponseOptions & { autoFlush?: number }
): Promise<void>
```

**Parameters**:
- `responseText` (string): The response to track
- `options.autoFlush` (number, default: 5): Threshold for auto-flush

**Behavior**:
- Logs the response word count
- Prints debug message to console
- Automatically writes to metrics.json when count reaches threshold
- Resets batch after write

## Data Structure

### metrics.json Format

```json
{
  "batches": [
    {
      "timestamp": "2024-01-15T10:30:45.123Z",
      "batchId": "batch-1705318245123-abc123def",
      "queryCount": 5,
      "responses": [
        {
          "wordCount": 15,
          "route": "/api/todos",
          "method": "GET",
          "status": 200,
          "timestamp": "2024-01-15T10:30:40.000Z"
        },
        // ... 4 more responses ...
      ],
      "stats": {
        "minWords": 5,
        "maxWords": 42,
        "rangeWords": 37,
        "totalWords": 125,
        "avgWords": 25
      }
    }
  ],
  "lastUpdated": "2024-01-15T10:30:45.123Z"
}
```

### ResponseWordCountEntry

```typescript
interface ResponseWordCountEntry {
  wordCount: number              // Number of words in response
  route?: string                 // API route (e.g., '/api/todos')
  method?: string                // HTTP method (GET, POST, etc.)
  status?: number                // HTTP status code (200, 404, etc.)
  timestamp: string              // ISO timestamp when logged
}
```

### MetricsData

```typescript
interface MetricsData {
  timestamp: string              // When batch was finalized
  batchId: string                // Unique batch identifier
  queryCount: number             // Number of responses in batch
  responses: ResponseWordCountEntry[]  // Individual response data
  stats: {
    minWords: number             // Minimum word count
    maxWords: number             // Maximum word count
    rangeWords: number           // maxWords - minWords
    totalWords: number           // Sum of all word counts
    avgWords: number             // Average word count (rounded to 2 decimals)
  }
}
```

## Integration Examples

### Example 1: In a Next.js API Route

```typescript
// app/api/todos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { logResponseAndMaybeFlush } from '@/lib/metrics-logger'

export async function GET(req: NextRequest) {
  try {
    const todos = [
      { id: 1, title: 'Task 1' },
      { id: 2, title: 'Task 2' },
    ]
    
    const responseText = JSON.stringify(todos)
    
    // Track word count (auto-flushes at 5 responses)
    await logResponseAndMaybeFlush(responseText, {
      route: '/api/todos',
      method: 'GET',
      status: 200,
    })
    
    return NextResponse.json(todos)
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Example 2: In Middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { metricsLogger } from '@/lib/metrics-logger'

export function middleware(req: NextRequest) {
  // Initialize batch on first request
  if (metricsLogger.getResponseCount() === 0) {
    metricsLogger.initBatch()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

### Example 3: With Response Timing

```typescript
// app/api/expensive/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { logResponseAndMaybeFlush } from '@/lib/metrics-logger'
import { startResponseTiming } from '@/api/response'

export async function GET(req: NextRequest) {
  const timing = startResponseTiming('/api/expensive', 'GET')
  
  try {
    // Expensive operation
    const result = { data: 'computed value' }
    const responseText = JSON.stringify(result)
    
    // Track both timing and metrics
    timing.logComplete(200)
    
    await logResponseAndMaybeFlush(responseText, {
      route: '/api/expensive',
      method: 'GET',
      status: 200,
    })
    
    return NextResponse.json(result)
  } catch (err) {
    timing.logComplete(500)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
```

## How Word Counting Works

The `countWords()` utility (from `word-count-logger.ts`) counts words by:
1. Trimming whitespace from the text
2. Splitting on whitespace regex: `/\s+/`
3. Returning the count of split tokens

**Examples**:
```typescript
countWords("Hello world")                    // 2
countWords("This is a test")                 // 4
countWords("  Extra   spaces  ")             // 3
countWords("Line\nbreak\ttab")               // 3
countWords("")                               // 0
```

## Atomic Write Safety

The `metricsLogger.writeToMetricsJson()` uses atomic write guarantees:

1. **Validation**: Checks metadata structure before write
2. **Hash Computation**: SHA-256 payload hash for integrity verification
3. **Temp File Write**: Writes to temporary file first
4. **Verification**: Re-computes hash to ensure correct write
5. **Atomic Rename**: Renames temp file to final location
6. **Rollback**: Deletes temp file if verification fails

This ensures **metrics.json is never corrupted** even if:
- Process crashes mid-write
- Disk becomes full
- Multiple instances attempt concurrent writes

## Monitoring

### View Metrics

Access metrics at: `http://localhost:3000/metrics.json`

### Debug Logging

Enable debug output:
```typescript
console.log(metricsLogger.formatLog())
// [metrics] responses=3 min=5 max=42 avg=18.33 total=55
```

### Check Batch Status

```typescript
const count = metricsLogger.getResponseCount()
const metrics = metricsLogger.toJSON()

console.log(`Batch: ${metrics.batchId}`)
console.log(`Responses logged: ${count}/5`)
console.log(`Stats:`, metrics.stats)
```

## Troubleshooting

### Metrics not appearing in metrics.json

1. **Check initialization**: Ensure `metricsLogger.initBatch()` was called
2. **Verify responses logged**: Use `metricsLogger.getResponseCount()`
3. **Check thresholds**: Default auto-flush is 5 responses
4. **File permissions**: Ensure `public/` directory is writable

### Inaccurate word counts

1. **Serialization**: JSON.stringify() the response before logging
2. **Whitespace**: Word count splits on all whitespace, including tabs/newlines
3. **Special characters**: Words with hyphens count as single word (e.g., "well-known" = 1 word)

### metrics.json getting too large

Implement rotation:
```typescript
// After metrics.json exceeds size limit
const MAX_SIZE = 1024 * 1024 * 10 // 10MB
metricsLogger.resetAll()
// Archive old metrics.json, start fresh
```

## Performance Notes

- **Word counting**: O(n) where n = string length (single pass)
- **Batch aggregation**: O(m) where m = response count (always ≤5)
- **File I/O**: Async with atomic write (fire-and-forget design)
- **Memory**: Fixed memory per batch (~1KB per response)

**Impact**: Negligible (<1ms) per request

## Testing

See `scripts/test-metrics-logger.mjs` for a complete test example:

```bash
node scripts/test-metrics-logger.mjs
```

This script:
1. Simulates 5 consecutive API responses
2. Counts words in each response
3. Aggregates statistics
4. Displays the metrics object that would be written

## Contributing

When modifying the metrics logger:

1. Update both `lib/metrics-logger.ts` and type definitions
2. Test with `scripts/test-metrics-logger.mjs`
3. Run `tsc --noEmit` to verify TypeScript compilation
4. Update this documentation

## Related Files

- `lib/metrics-logger.ts` — Main implementation
- `lib/word-count-logger.ts` — Word counting utility
- `lib/atomic-write.ts` — Atomic file writing with validation
- `api/response.js` — Response timing measurement
- `lib/metrics-integration-example.ts` — Integration examples
- `docs/METRICS_LOGGER.md` — This documentation

## License

Same as project.
