/**
 * Connection Quality Events Table Query via agent_exec_sql()
 * 
 * This module implements SQL execution for querying the connection_quality_events table
 * using agent_exec_sql() with SELECT COUNT(*) and column inspection queries.
 */

import { createClient } from '@supabase/supabase-js';

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  ordinal_position?: number;
}

interface TableStats {
  row_count: number;
  columns: ColumnInfo[];
  table_name: string;
  schema_name: string;
}

/**
 * Query connection_quality_events table structure and row count
 * 
 * @param supabaseClient - Initialized Supabase client
 * @returns Promise containing table statistics and column information
 */
export async function queryConnectionQualityEventsStructure(
  supabaseClient: ReturnType<typeof createClient>
): Promise<TableStats> {
  try {
    // Query 1: Get row count
    const { data: rowCountData, error: rowCountError } = await supabaseClient
      .rpc('agent_exec_sql', {
        query: 'SELECT COUNT(*) as row_count FROM connection_quality_events'
      })
      .single();

    if (rowCountError) {
      throw new Error(`Row count query failed: ${rowCountError.message}`);
    }

    const rowCount = rowCountData?.row_count || 0;

    // Query 2: Get column information
    const { data: columnsData, error: columnsError } = await supabaseClient
      .rpc('agent_exec_sql', {
        query: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            ordinal_position
          FROM information_schema.columns 
          WHERE table_name = 'connection_quality_events' 
          ORDER BY ordinal_position
        `
      });

    if (columnsError) {
      throw new Error(`Column inspection query failed: ${columnsError.message}`);
    }

    return {
      row_count: rowCount,
      columns: columnsData as ColumnInfo[],
      table_name: 'connection_quality_events',
      schema_name: 'public'
    };
  } catch (error) {
    console.error('Error querying connection_quality_events structure:', error);
    throw error;
  }
}

/**
 * Get table statistics for connection_quality_events
 * 
 * @param supabaseClient - Initialized Supabase client
 * @returns Promise containing detailed table statistics
 */
export async function getConnectionQualityEventsStats(
  supabaseClient: ReturnType<typeof createClient>
) {
  try {
    const { data, error } = await supabaseClient
      .rpc('agent_exec_sql', {
        query: `
          SELECT
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
            pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
            pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as indexes_size
          FROM pg_tables
          WHERE tablename = 'connection_quality_events' 
            AND schemaname = 'public'
        `
      })
      .single();

    if (error) {
      throw new Error(`Table statistics query failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error getting connection_quality_events stats:', error);
    throw error;
  }
}

/**
 * Get sample data from connection_quality_events table
 * 
 * @param supabaseClient - Initialized Supabase client
 * @param limit - Maximum number of rows to retrieve (default: 10)
 * @returns Promise containing sample rows
 */
export async function getSampleConnectionQualityEvents(
  supabaseClient: ReturnType<typeof createClient>,
  limit: number = 10
) {
  try {
    const { data, error } = await supabaseClient
      .rpc('agent_exec_sql', {
        query: `SELECT * FROM connection_quality_events LIMIT ${limit}`
      });

    if (error) {
      throw new Error(`Sample data query failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error getting sample connection_quality_events:', error);
    throw error;
  }
}

/**
 * Get event type statistics from connection_quality_events
 * 
 * @param supabaseClient - Initialized Supabase client
 * @returns Promise containing event type distribution
 */
export async function getEventTypeStatistics(
  supabaseClient: ReturnType<typeof createClient>
) {
  try {
    const { data, error } = await supabaseClient
      .rpc('agent_exec_sql', {
        query: `
          SELECT 
            event_type,
            COUNT(*) as count,
            COUNT(*) FILTER (WHERE resolved_at IS NOT NULL) as resolved_count,
            COUNT(*) FILTER (WHERE dismissed_at IS NOT NULL) as dismissed_count
          FROM connection_quality_events
          GROUP BY event_type
          ORDER BY count DESC
        `
      });

    if (error) {
      throw new Error(`Event type statistics query failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error getting event type statistics:', error);
    throw error;
  }
}

/**
 * Main execution function for table inspection
 */
export async function executeConnectionQualityEventsInspection() {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 Querying connection_quality_events table structure...\n');

  try {
    // Get table structure
    const tableStats = await queryConnectionQualityEventsStructure(supabase);
    
    console.log('📊 Table Statistics:');
    console.log(`   Total Rows: ${tableStats.row_count}`);
    console.log(`   Total Columns: ${tableStats.columns.length}`);
    console.log(`   Schema: ${tableStats.schema_name}`);
    console.log(`   Table: ${tableStats.table_name}\n`);

    console.log('📋 Column Information:');
    console.log('   ┌─────────────────────┬──────────────────┬──────────┬──────────────┐');
    console.log('   │ Column Name         │ Data Type        │ Nullable │ Default      │');
    console.log('   ├─────────────────────┼──────────────────┼──────────┼──────────────┤');
    
    tableStats.columns.forEach((col) => {
      const nullable = col.is_nullable === 'YES' ? 'Yes' : 'No';
      const defaultVal = col.column_default || '-';
      console.log(
        `   │ ${col.column_name.padEnd(19)} │ ${col.data_type.padEnd(16)} │ ${nullable.padEnd(8)} │ ${defaultVal.padEnd(12)} │`
      );
    });
    
    console.log('   └─────────────────────┴──────────────────┴──────────┴──────────────┘\n');

    // Get additional statistics if table is not empty
    if (tableStats.row_count > 0) {
      try {
        const eventStats = await getEventTypeStatistics(supabase);
        console.log('📈 Event Type Statistics:');
        eventStats.forEach((stat: any) => {
          console.log(`   ${stat.event_type}: ${stat.count} total, ${stat.resolved_count} resolved, ${stat.dismissed_count} dismissed`);
        });
        console.log();
      } catch (error) {
        console.log('   (Event statistics unavailable)\n');
      }
    }

    console.log('✅ Query execution completed successfully!');
    
    return tableStats;
  } catch (error) {
    console.error('❌ Error during table inspection:', error);
    throw error;
  }
}

// Run inspection if executed directly
if (require.main === module) {
  executeConnectionQualityEventsInspection().catch(console.error);
}
