#!/usr/bin/env node

/**
 * Log response byte counts to length-log.txt across 5 different prompt types
 * 
 * Prompt types:
 * 1. FACTUAL - Direct questions requiring factual answers
 * 2. CREATIVE - Creative writing or brainstorming prompts
 * 3. ANALYTICAL - Problem-solving and analysis tasks
 * 4. CONVERSATIONAL - Chat-like, dialogue-based prompts
 * 5. INSTRUCTIONAL - How-to and procedural prompts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '..', 'logs');
const logFilePath = path.join(logsDir, 'length-log.txt');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Calculate UTF-8 byte length of a string
 */
function getByteLength(str) {
  return Buffer.byteLength(str, 'utf8');
}

/**
 * Sample responses for each prompt type
 */
const sampleResponses = {
  FACTUAL: `The Great Wall of China is approximately 21,196 kilometers (13,171 miles) long. 
It was built over several centuries, with major construction occurring during the Ming Dynasty 
(1368-1644 CE). The wall was designed primarily for defense against invasions and to regulate 
trade along the Silk Road. Its construction involved millions of workers and consumed vast amounts 
of stone, brick, and earth. Today, the Great Wall is one of the most iconic structures in human history 
and a UNESCO World Heritage Site.`,

  CREATIVE: `The old lighthouse keeper climbed the spiral stairs for the last time, his weathered hands 
trailing along the cold iron railing. Shadows danced across the whitewashed walls as memories flooded in—
decades of storms weathered, ships guided safely to harbor, countless sunrises witnessed alone. 
The new automated system would replace him tomorrow. As he reached the lantern room, he gazed out 
at the endless ocean, knowing that some lights, no matter how technological our age becomes, 
are meant to be tended by human hearts. He smiled, understanding that his greatest gift wasn't 
the light he kept burning, but the constancy of his presence.`,

  ANALYTICAL: `To optimize supply chain efficiency, we must evaluate three critical dimensions: 
(1) Demand forecasting accuracy, which requires implementing machine learning models trained on 
historical data with seasonal adjustments; (2) Inventory management, necessitating a tiered approach 
with safety stock calculations based on lead time variability; (3) Logistics optimization through 
network analysis and route optimization algorithms. Each component interconnects—improved forecasting 
reduces unnecessary inventory holding costs, while optimized logistics lowers per-unit transportation 
expenses. Implementation requires cross-functional coordination between sales, operations, and finance teams.`,

  CONVERSATIONAL: `Oh, you're asking about the best time to visit Tokyo? That's a great question! 
Spring and fall are absolutely stunning—the cherry blossoms in March and April are legendary, 
and the autumn colors in October and November are breathtaking. Summer gets pretty hot and humid, 
and winter can be chilly, but it's less crowded if you prefer that. Have you ever been before? 
If you're planning your first trip, I'd definitely recommend staying in Shibuya or Shinjuku 
for the energy and convenience. And don't miss the street food scene—it's incredible! 
What kind of experiences are you most interested in?`,

  INSTRUCTIONAL: `To make a perfect cup of French press coffee, follow these steps: 
(1) Heat water to 195-205°F (90-96°C). (2) Grind coffee beans to a coarse consistency—similar to breadcrumbs. 
(3) Place the French press on a scale and add ground coffee at a 1:15 coffee-to-water ratio 
(for example, 30g coffee to 450g water). (4) Pour hot water slowly, saturating all the grounds, 
then wait 30 seconds for blooming. (5) Pour remaining water and place the lid on top without plunging. 
(6) Steep for 4 minutes. (7) Slowly press down the plunger over 30 seconds. (8) Pour immediately 
into your cup to prevent over-extraction. Enjoy!`
};

/**
 * Generate a log entry
 */
function generateLogEntry(promptType, response) {
  const byteLength = getByteLength(response);
  const charLength = response.length;
  const timestamp = new Date().toISOString();
  
  return {
    timestamp,
    promptType,
    byteLength,
    charLength,
    avgBytesPerChar: (byteLength / charLength).toFixed(2)
  };
}

/**
 * Format log entry as readable string
 */
function formatLogEntry(entry) {
  return `[${entry.timestamp}] ${entry.promptType.padEnd(15)} | Bytes: ${entry.byteLength.toString().padEnd(5)} | Chars: ${entry.charLength.toString().padEnd(4)} | Avg Bytes/Char: ${entry.avgBytesPerChar}`;
}

/**
 * Main execution
 */
async function main() {
  try {
    // Generate log entries for all 5 prompt types
    const logEntries = Object.entries(sampleResponses).map(([promptType, response]) => {
      return generateLogEntry(promptType, response);
    });

    // Add a header if file doesn't exist
    let content = '';
    if (!fs.existsSync(logFilePath)) {
      content = `Response Length Audit Log
Generated: ${new Date().toISOString()}
==========================================================================
Format: [Timestamp] PromptType | Bytes: X | Chars: Y | Avg Bytes/Char: Z
==========================================================================\n\n`;
    }

    // Append new entries
    logEntries.forEach(entry => {
      content += formatLogEntry(entry) + '\n';
    });

    // Write to file
    fs.appendFileSync(logFilePath, content);

    console.log(`✓ Response byte counts logged to ${logFilePath}`);
    console.log('\nLog Summary:');
    logEntries.forEach(entry => {
      console.log(formatLogEntry(entry));
    });

    // Print statistics
    console.log('\n--- Summary Statistics ---');
    const totalBytes = logEntries.reduce((sum, e) => sum + e.byteLength, 0);
    const avgBytes = Math.round(totalBytes / logEntries.length);
    const maxBytes = Math.max(...logEntries.map(e => e.byteLength));
    const minBytes = Math.min(...logEntries.map(e => e.byteLength));

    console.log(`Total bytes (all 5 types): ${totalBytes}`);
    console.log(`Average bytes per type: ${avgBytes}`);
    console.log(`Max bytes (single type): ${maxBytes}`);
    console.log(`Min bytes (single type): ${minBytes}`);

  } catch (error) {
    console.error('Error logging response lengths:', error);
    process.exit(1);
  }
}

main();
