# Dismissing Resolved Anomalies from Connection Quality Events

## Overview

This document describes the implementation of dismissing resolved connection quality anomalies using the `dismiss_anomaly()` function on rows where `resolved_at IS NOT NULL`.

## Schema Changes

### New Column

A new `resolved_at` column (timestamptz) has been added to the `connection_quality_events` table to track when anomalies are resolved.

```sql
ALTER TABLE public.connection_quality_events
ADD COLUMN resolved_at timestamptz;
```

### New Indexes

Two indexes were created to optimize queries for resolved anomalies:

1. `idx_connection_quality_resolved_at` - Index on resolved_at for efficient ordering
2. `idx_connection_quality_resolved_unresolved` - Composite index for finding resolved but not dismissed anomalies

## Database Functions

### 1. `dismiss_anomaly(p_event_id, p_resolution_notes)`

**Purpose**: Dismisses a single anomaly event

**Parameters**:
- `p_event_id` (uuid): The ID of the connection_quality_events record
- `p_resolution_notes` (text, optional): Notes explaining the resolution

**Returns**:
- `success` (boolean): Whether the operation was successful
- `message` (text): Descriptive message about the result
- `dismissed_at` (timestamptz): When the anomaly was dismissed
- `event_id` (uuid): The event ID that was processed

**Example**:
```sql
SELECT * FROM dismiss_anomaly(
  '123e4567-e89b-12d3-a456-426614174000',
  'Network recovered after failover'
);
```

### 2. `dismiss_resolved_anomaly(p_event_id, p_resolved_at, p_resolution_notes)`

**Purpose**: Marks an anomaly as resolved and immediately dismisses it

**Parameters**:
- `p_event_id` (uuid): The ID of the event to process
- `p_resolved_at` (timestamptz, default: now()): When the anomaly was resolved
- `p_resolution_notes` (text, optional): Resolution notes

**Returns**: Same as `dismiss_anomaly()`

**Example**:
```sql
SELECT * FROM dismiss_resolved_anomaly(
  '123e4567-e89b-12d3-a456-426614174000',
  now(),
  'Connection recovered after failover'
);
```

### 3. `dismiss_resolved_anomalies_batch()`

**Purpose**: Batch dismisses all anomalies where `resolved_at IS NOT NULL` and `dismissed_at IS NULL`

**Parameters**: None

**Returns**:
- `total_resolved` (bigint): Count of anomalies with resolved_at IS NOT NULL
- `total_dismissed` (bigint): Count of anomalies dismissed in this call
- `message` (text): Summary message

**Example**:
```sql
SELECT * FROM dismiss_resolved_anomalies_batch();
```

## Usage Patterns

### Pattern 1: Find Resolved But Not Dismissed Anomalies

```sql
SELECT 
  id,
  event_type,
  created_at,
  resolved_at,
  dismissed_at
FROM public.connection_quality_events
WHERE resolved_at IS NOT NULL
  AND dismissed_at IS NULL
ORDER BY resolved_at ASC;
```

### Pattern 2: Dismiss Individual Anomalies

```sql
-- Dismiss a specific resolved anomaly
SELECT * FROM dismiss_anomaly(
  'event-uuid-here',
  'Manual dismissal: issue confirmed resolved'
);
```

### Pattern 3: Batch Dismiss All Resolved Anomalies

```sql
-- Automatically dismiss all resolved anomalies
SELECT * FROM dismiss_resolved_anomalies_batch();
```

### Pattern 4: Mark and Dismiss in One Call

```sql
-- Mark as resolved and dismiss immediately
SELECT * FROM dismiss_resolved_anomaly(
  'event-uuid-here',
  now(),
  'Auto-resolved and dismissed'
);
```

## SQL Migration

The migration file `0012_dismiss_resolved_anomalies.sql` contains:

1. Addition of `resolved_at` column to `connection_quality_events` table
2. Creation of two performance indexes
3. Implementation of `dismiss_resolved_anomalies_batch()` function
4. Implementation of `dismiss_resolved_anomaly()` function

## TypeScript/JavaScript Usage

### Using Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Find resolved anomalies
const { data: anomalies } = await supabase
  .from('connection_quality_events')
  .select('*')
  .not('resolved_at', 'is', null)
  .is('dismissed_at', null);

// Dismiss a single anomaly
const { data: result } = await supabase.rpc('dismiss_anomaly', {
  p_event_id: anomalyId,
  p_resolution_notes: 'Resolved and dismissed',
});

// Batch dismiss all resolved anomalies
const { data: batchResult } = await supabase.rpc(
  'dismiss_resolved_anomalies_batch'
);
```

## React Component

A React component `ResolvedAnomaliesList.tsx` is provided that:

- Lists all resolved but undismissed anomalies
- Allows dismissing individual anomalies
- Provides a "Dismiss All" button for batch operations
- Shows real-time updates via Supabase subscriptions
- Displays status messages for user feedback

### Component Props

The component is standalone and requires:
- `NEXT_PUBLIC_SUPABASE_URL` environment variable
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variable

### Usage

```tsx
import ResolvedAnomaliesList from '@/components/ResolvedAnomaliesList';

export default function DashboardPage() {
  return (
    <div>
      <ResolvedAnomaliesList />
    </div>
  );
}
```

## Node.js Script

A standalone Node.js script `scripts/dismiss-resolved-anomalies.ts` demonstrates:

- Connecting to Supabase
- Querying for resolved anomalies
- Dismissing anomalies individually
- Using the batch dismiss function
- Error handling and status reporting

### Running the Script

```bash
npm run ts-node scripts/dismiss-resolved-anomalies.ts
```

## Workflow

### Typical Workflow for Resolving Anomalies

1. **Anomaly Detected**: An anomaly event is created with current timestamp
2. **Investigation**: Operations team investigates the root cause
3. **Resolution**: Once resolved, either:
   - Operator marks `resolved_at` manually, then calls `dismiss_anomaly()`
   - OR uses `dismiss_resolved_anomaly()` to do both in one call
4. **Confirmation**: System confirms dismissal via notification or UI update
5. **Archival**: Dismissed anomalies can be filtered out of active views

### Batch Dismissal Workflow

For systems that automatically mark anomalies as resolved:

1. **Anomaly Auto-Resolution**: System marks `resolved_at` when issue recovers
2. **Batch Dismissal**: Run `dismiss_resolved_anomalies_batch()` periodically
3. **Summary**: Get count of dismissed anomalies for reporting

## Troubleshooting

### Anomaly Already Dismissed

If calling `dismiss_anomaly()` on an already-dismissed event:

```
{
  success: false,
  message: "Event ... was already dismissed at ...",
  dismissed_at: "2024-01-01T12:00:00Z",
  event_id: "..."
}
```

### Event Not Found

If the event ID doesn't exist:

```
{
  success: false,
  message: "Event with ID ... not found",
  dismissed_at: null,
  event_id: "..."
}
```

## Performance Considerations

- **Index Coverage**: The `idx_connection_quality_resolved_unresolved` index optimizes the batch dismiss query
- **Batch Operations**: For large numbers of anomalies, the batch function is more efficient than individual calls
- **Real-time Updates**: The component uses Supabase subscriptions for live updates

## Best Practices

1. **Always provide resolution_notes**: Include context about why the anomaly was dismissed
2. **Use batch dismissal**: When processing many anomalies, use the batch function for efficiency
3. **Monitor resolved_at timestamps**: Use these to identify which anomalies were auto-resolved vs manually investigated
4. **Archive dismissed anomalies**: Filter out dismissed events from primary dashboards
5. **Alert on new anomalies**: Set up notifications when `resolved_at IS NULL AND dismissed_at IS NULL`

## References

- Schema: `connection_quality_events` table
- Related tables: `task_throughput_events` (similar anomaly tracking)
- Notification channel: `connection_quality`
