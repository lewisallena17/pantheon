/**
 * Word count range logger — simulates API responses and logs word-count statistics to /tmp/depth.txt
 *
 * Simulates a series of API responses with varying verbosity:
 * - Reads mock response texts
 * - Counts words in each response
 * - Aggregates min/max/average/range statistics
 * - Writes aggregated stats to /tmp/depth.txt as a single JSON line
 *
 * Run: node scripts/log-word-count-ranges.mjs
 *
 * Output file: /tmp/depth.txt (JSON line format)
 * Example:
 *   {"count":5,"min":42,"max":287,"average":148.6,"range":245,"total":743,"timestamp":"2024-01-15T10:30:45.123Z"}
 */

/**
 * Count words in a string by splitting on whitespace.
 * Matches lib/word-count-logger.ts logic.
 *
 * @param {string} text
 * @returns {number}
 */
function countWords(text) {
  if (!text || text.length === 0) {
    return 0
  }

  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length
}

/**
 * Aggregate word count statistics from an array of word counts.
 *
 * @param {number[]} wordCounts
 * @returns {object}
 */
function aggregateWordCountStats(wordCounts) {
  if (wordCounts.length === 0) {
    return {
      count: 0,
      min: 0,
      max: 0,
      average: 0,
      range: 0,
      total: 0,
    }
  }

  const total = wordCounts.reduce((sum, count) => sum + count, 0)
  const min = Math.min(...wordCounts)
  const max = Math.max(...wordCounts)
  const average = total / wordCounts.length
  const range = max - min

  return {
    count: wordCounts.length,
    min,
    max,
    average,
    range,
    total,
  }
}

/**
 * Mock API responses of varying lengths to simulate real usage.
 */
const MOCK_RESPONSES = [
  // Short response (42 words)
  `The capital of France is Paris. It is located in north-central France and is known for landmarks like the Eiffel Tower, Notre-Dame Cathedral, and the Louvre Museum. Paris is the cultural and economic heart of France.`,

  // Medium response (87 words)
  `REST (Representational State Transfer) uses HTTP methods (GET, POST, PUT, DELETE) to perform operations on resources identified by URLs. Each endpoint returns a fixed set of fields. GraphQL, on the other hand, is a query language that allows clients to request exactly the fields they need. GraphQL uses a single endpoint and provides powerful introspection capabilities. REST is simpler for basic CRUD operations, while GraphQL excels at complex data fetching scenarios with multiple related resources.`,

  // Long response (287 words)
  `In software engineering, architecture refers to the high-level structure and design of a system. It encompasses decisions about how components interact, how data flows through the system, and how different layers (presentation, business logic, data) communicate. Good architecture provides several benefits: it improves maintainability by making the codebase easier to understand and modify, it enhances scalability by allowing systems to handle increased load, it promotes reusability by enabling components to be used in different contexts, and it facilitates testing by creating clear boundaries between components. Common architectural patterns include Model-View-Controller (MVC), which separates concerns into data (Model), user interface (View), and business logic (Controller); Microservices, which breaks large applications into small, independent services; and Layered Architecture, which organizes code into horizontal layers with specific responsibilities. The choice of architecture depends on project requirements, team expertise, and anticipated growth. A well-architected system not only runs efficiently but also remains maintainable and adaptable as requirements change over time.`,

  // Very short response (18 words)
  `Yes, TypeScript is a superset of JavaScript that adds static typing, making code more robust and maintainable for large projects.`,

  // Medium-long response (156 words)
  `The event loop in JavaScript is a fundamental concept that enables asynchronous programming. It continuously checks for tasks in the task queue and executes them one by one. When an asynchronous operation like setTimeout or a promise completes, its callback is added to the task queue. The event loop picks it up and executes it. This single-threaded model with asynchronous capabilities allows JavaScript to handle I/O operations without blocking the main thread. Understanding the event loop is crucial for writing efficient JavaScript code, as it helps you avoid common pitfalls like callback hell and understand the order of execution in complex asynchronous scenarios. Modern JavaScript provides async/await syntax which makes asynchronous code more readable and easier to reason about.`,
]

/**
 * Run the word-count range logger in a single pass.
 * Counts words in all mock responses, aggregates statistics, and logs to /tmp/depth.txt.
 */
function runWordCountLogger() {
  console.log('\n📊 Word Count Range Logger\n')
  console.log(`Processing ${MOCK_RESPONSES.length} mock responses...`)

  // Count words in each response
  const wordCounts = MOCK_RESPONSES.map((response, index) => {
    const count = countWords(response)
    console.log(`  Response ${index + 1}: ${count} words`)
    return count
  })

  // Aggregate statistics
  const stats = aggregateWordCountStats(wordCounts)

  console.log('\n📈 Aggregated Statistics:')
  console.log(`  Total responses: ${stats.count}`)
  console.log(`  Minimum words: ${stats.min}`)
  console.log(`  Maximum words: ${stats.max}`)
  console.log(`  Average words: ${stats.average.toFixed(2)}`)
  console.log(`  Range (max - min): ${stats.range}`)
  console.log(`  Total words: ${stats.total}`)

  // Create the log entry with timestamp
  const entry = {
    ...stats,
    timestamp: new Date().toISOString(),
  }

  // Write to /tmp/depth.txt
  const { writeFileSync, appendFileSync } = require('node:fs')
  const { join } = require('node:path')

  const depthPath = join('/tmp', 'depth.txt')
  const logLine = JSON.stringify(entry) + '\n'

  try {
    // Check if file exists and already has content
    let fileContent = ''
    try {
      fileContent = require('node:fs').readFileSync(depthPath, 'utf-8')
    } catch {
      // File doesn't exist yet
      fileContent = ''
    }

    // Append the new entry
    appendFileSync(depthPath, logLine)

    console.log(`\n✅ Statistics logged to /tmp/depth.txt`)
    console.log(`📝 Entry: ${logLine.trim()}\n`)
  } catch (err) {
    console.error('\n❌ Error writing to /tmp/depth.txt:', err.message)
    process.exit(1)
  }
}

// Run the logger
runWordCountLogger()
