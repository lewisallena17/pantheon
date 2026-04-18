#!/usr/bin/env node

/**
 * execute-bounded-god-status-query.mjs
 * 
 * Execute bounded SELECT * FROM god_status LIMIT 50 via agent_exec_sql()
 * with explicit result validation.
 * 
 * Usage:
 *   node scripts/execute-bounded-god-status-query.mjs
 *   npm run execute:bounded-god-status
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Validate individual row data
 * 
 * @param {any} row - Row to validate
 * @param {number} index - Row index for error reporting
 * @returns {string[]} Validation errors for this row (empty if valid)
 */
function validateRow(row, index) {
  const errors = []

  // Check required fields exist
  if (row === null || row === undefined) {
    errors.push(`Row ${index}: null or undefined`)
    return errors
  }

  if (typeof row !== 'object') {
    errors.push(`Row ${index}: not an object (type: ${typeof row})`)
    return errors
  }

  // Validate required columns
  if (!('id' in row)) {
    errors.push(`Row ${index}: missing 'id' column`)
  } else if (typeof row.id !== 'number') {
    errors.push(`Row ${index}: 'id' is not a number (type: ${typeof row.id})`)
  }

  if (!('thought' in row)) {
    errors.push(`Row ${index}: missing 'thought' column`)
  } else if (typeof row.thought !== 'string') {
    errors.push(
      `Row ${index}: 'thought' is not a string (type: ${typeof row.thought})`
    )
  }

  if (!('updated_at' in row)) {
    errors.push(`Row ${index}: missing 'updated_at' column`)
  } else if (typeof row.updated_at !== 'string') {
    errors.push(
      `Row ${index}: 'updated_at' is not a string (type: ${typeof row.updated_at})`
    )
  }

  // Validate optional JSONB columns if present
  if ('meta' in row && row.meta !== null && typeof row.meta !== 'object') {
    errors.push(`Row ${index}: 'meta' is not an object (type: ${typeof row.meta})`)
  }

  if ('intent' in row && row.intent !== null && typeof row.intent !== 'object') {
    errors.push(
      `Row ${index}: 'intent' is not an object (type: ${typeof row.intent})`
    )
  }

  return errors
}

/**
 * Validate complete result set
 * 
 * @param {any[]} rows - Rows returned from query
 * @returns {Object} Validation results
 */
function validateResultSet(rows) {
  const errors = []
  const warnings = []

  // Validation 1: Schema is valid
  let schemaValid = true
  if (!Array.isArray(rows)) {
    errors.push(`Result is not an array (type: ${typeof rows})`)
    schemaValid = false
  }

  // Validation 2: Row count is valid (0-50)
  let rowCountValid = true
  if (!Array.isArray(rows)) {
    rowCountValid = false
  } else if (rows.length < 0) {
    errors.push(`Row count is negative: ${rows.length}`)
    rowCountValid = false
  } else if (rows.length > 50) {
    errors.push(
      `Row count exceeds LIMIT 50: ${rows.length} rows returned (LIMIT not enforced!)`
    )
    rowCountValid = false
  } else if (rows.length === 0) {
    warnings.push('Query returned 0 rows (table may be empty)')
  }

  // Validation 3: All data types are valid
  let dataTypesValid = true
  const rowErrors = []
  rows.forEach((row, index) => {
    const rowValidationErrors = validateRow(row, index)
    rowErrors.push(...rowValidationErrors)
  })

  if (rowErrors.length > 0) {
    dataTypesValid = false
    errors.push(...rowErrors)
  }

  // Validation 4: No completely null rows
  let noNullRowsValid = true
  rows.forEach((row, index) => {
    if (row === null || row === undefined) {
      errors.push(`Row ${index}: completely null/undefined`)
      noNullRowsValid = false
    }
  })

  // Validation 5: LIMIT is enforced
  const limitEnforcedValid = rows.length <= 50

  return {
    schemaValid,
    rowCountValid,
    dataTypesValid,
    noNullRowsValid,
    limitEnforcedValid,
    errors,
    warnings,
  }
}

/**
 * Execute bounded SELECT * FROM god_status LIMIT 50 via agent_exec_sql()
 * with explicit result validation.
 * 
 * @param {string} supabaseUrl - Supabase project URL
 * @param {string} supabaseKey - Supabase service role key
 * @returns {Promise<Object>} Query execution result
 */
export async function executeBoundedGodStatusQuery(
  supabaseUrl,
  supabaseKey
) {
  const startTime = performance.now()
  const executedAt = new Date().toISOString()
  const query = 'SELECT * FROM god_status LIMIT 50'

  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })

    console.log('\n📡 Executing bounded god_status query via agent_exec_sql()...')
    console.log(`   Query: ${query}`)
    console.log(`   Time: ${executedAt}\n`)

    // Execute query via agent_exec_sql() RPC
    const { data, error } = await supabase.rpc('agent_exec_sql', {
      query,
    })

    if (error) {
      throw new Error(`RPC execution failed: ${error.message}`)
    }

    // Validate response structure
    if (!data) {
      throw new Error('RPC returned null/undefined response')
    }

    if (!Array.isArray(data)) {
      throw new Error(
        `RPC returned non-array response (type: ${typeof data})`
      )
    }

    // Extract rows from response
    // agent_exec_sql returns data as array of objects directly
    const rows = Array.isArray(data) ? data : []

    console.log(`✓ Query executed successfully`)
    console.log(`✓ Rows returned: ${rows.length}`)

    // Validate result set
    console.log('\n🔍 Validating result set...')
    const validationResults = validateResultSet(rows)

    // Report validation results
    console.log(`   ✓ Schema valid: ${validationResults.schemaValid}`)
    console.log(`   ✓ Row count valid (0-50): ${validationResults.rowCountValid}`)
    console.log(`   ✓ Data types valid: ${validationResults.dataTypesValid}`)
    console.log(
      `   ✓ No null rows: ${validationResults.noNullRowsValid}`
    )
    console.log(
      `   ✓ LIMIT enforced: ${validationResults.limitEnforcedValid}`
    )

    // Report warnings
    if (validationResults.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      validationResults.warnings.forEach((warning) => {
        console.log(`   - ${warning}`)
      })
    }

    // Report errors
    if (validationResults.errors.length > 0) {
      console.log('\n❌ Validation Errors:')
      validationResults.errors.forEach((error) => {
        console.log(`   - ${error}`)
      })
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    // Build result
    const result = {
      success:
        validationResults.schemaValid &&
        validationResults.rowCountValid &&
        validationResults.dataTypesValid &&
        validationResults.noNullRowsValid &&
        validationResults.limitEnforcedValid &&
        validationResults.errors.length === 0,
      rows,
      rowCount: rows.length,
      executionTime,
      validationResults,
      metadata: {
        query,
        limit: 50,
        executedAt,
      },
    }

    // Report execution summary
    console.log('\n📊 Execution Summary:')
    console.log(`   Rows retrieved: ${result.rowCount}/50`)
    console.log(`   Execution time: ${result.executionTime.toFixed(2)}ms`)
    console.log(`   Overall success: ${result.success ? '✅ PASS' : '❌ FAIL'}`)

    return result
  } catch (error) {
    const endTime = performance.now()
    const executionTime = endTime - startTime

    const errorMessage = error instanceof Error ? error.message : String(error)

    console.error(`\n❌ Query execution failed: ${errorMessage}`)

    return {
      success: false,
      rows: [],
      rowCount: 0,
      executionTime,
      validationResults: {
        schemaValid: false,
        rowCountValid: false,
        dataTypesValid: false,
        noNullRowsValid: false,
        limitEnforcedValid: false,
        errors: [errorMessage],
        warnings: [],
      },
      metadata: {
        query,
        limit: 50,
        executedAt,
      },
    }
  }
}

/**
 * Format execution result as markdown
 */
function formatResultAsMarkdown(result) {
  let md = `# Bounded God Status Query Results\n\n`
  md += `**Executed**: ${result.metadata.executedAt}\n\n`

  // Metadata Section
  md += `## Query Metadata\n\n`
  md += `\`\`\`sql\n${result.metadata.query}\n\`\`\`\n\n`
  md += `| Property | Value |\n`
  md += `|----------|-------|\n`
  md += `| LIMIT | ${result.metadata.limit} |\n`
  md += `| Rows Retrieved | ${result.rowCount}/${result.metadata.limit} |\n`
  md += `| Execution Time | ${result.executionTime.toFixed(2)}ms |\n`
  md += `| Status | ${result.success ? '✅ PASS' : '❌ FAIL'} |\n\n`

  // Validation Summary
  md += `## Validation Results\n\n`
  md += `| Check | Status |\n`
  md += `|-------|--------|\n`
  md += `| Schema Valid | ${result.validationResults.schemaValid ? '✅' : '❌'} |\n`
  md += `| Row Count Valid (0-50) | ${
    result.validationResults.rowCountValid ? '✅' : '❌'
  } |\n`
  md += `| Data Types Valid | ${result.validationResults.dataTypesValid ? '✅' : '❌'} |\n`
  md += `| No Null Rows | ${result.validationResults.noNullRowsValid ? '✅' : '❌'} |\n`
  md += `| LIMIT Enforced | ${result.validationResults.limitEnforcedValid ? '✅' : '❌'} |\n\n`

  // Data Section
  if (result.rowCount > 0) {
    md += `## Data (${result.rowCount} rows)\n\n`
    md += result.rows
      .map((row, idx) => {
        let rowMd = `### Row ${idx + 1}\n\n`
        rowMd += `\`\`\`json\n${JSON.stringify(row, null, 2)}\n\`\`\`\n\n`
        return rowMd
      })
      .join('')
  }

  // Errors and Warnings
  if (result.validationResults.warnings.length > 0) {
    md += `## Warnings\n\n`
    result.validationResults.warnings.forEach((warning) => {
      md += `- ⚠️ ${warning}\n`
    })
    md += `\n`
  }

  if (result.validationResults.errors.length > 0) {
    md += `## Errors\n\n`
    result.validationResults.errors.forEach((error) => {
      md += `- ❌ ${error}\n`
    })
    md += `\n`
  }

  return md
}

/**
 * Main execution (when run as script)
 */
async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'not set')
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'set' : 'not set')
    process.exit(1)
  }

  const result = await executeBoundedGodStatusQuery(supabaseUrl, supabaseKey)

  console.log('\n' + '='.repeat(60))
  console.log('📄 Full Result (JSON):')
  console.log('='.repeat(60))
  console.log(JSON.stringify(result, null, 2))

  console.log('\n' + '='.repeat(60))
  console.log('📋 Markdown Report:')
  console.log('='.repeat(60))
  console.log(formatResultAsMarkdown(result))

  process.exit(result.success ? 0 : 1)
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
