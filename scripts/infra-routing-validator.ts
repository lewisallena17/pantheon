#!/usr/bin/env node
/**
 * Infrastructure Routing Validator
 * 
 * Validates routing decisions for low-risk infra tasks based on:
 * 1. Infra category success baseline (0% undefined → establish via task #1)
 * 2. Risk stratification (completed < vetoed < pending)
 * 3. Routing accuracy (category matching)
 * 
 * Usage: npx ts-node scripts/infra-routing-validator.ts
 */

import { createClient } from "@supabase/supabase-js";

interface InfraTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  task_category: string;
  retry_count: number;
  created_at: string;
}

interface RoutingDecision {
  taskId: string;
  route: "green" | "yellow" | "red";
  reason: string;
  riskLevel: number; // 1-5, 1=lowest
  estimatedSuccess: number; // 0-100%
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Mapping of identified 3 lowest-risk infra tasks
const BASELINE_INFRA_TASKS = {
  COMPLETED_CURIOSITY: "91717bba-cb10-49f4-8276-abdb40957ede",
  VETOED_TOOL_RESULT: "045a070a-57ad-4b96-a797-57c19d791901",
  VETOED_TOOL_USE_ID: "9c068d9b-4a61-4758-b571-298e2f1923b4",
};

/**
 * Calculate risk score (1=lowest, 5=highest)
 */
function calculateRiskScore(task: InfraTask): number {
  let risk = 0;

  // Status-based risk (completed is safest)
  if (task.status === "completed") risk += 0;
  else if (task.status === "vetoed") risk += 2; // Needs review
  else if (task.status === "in_progress") risk += 3;
  else if (task.status === "pending") risk += 4;

  // Retry count (each retry adds risk)
  risk += Math.min(task.retry_count || 0, 2); // Cap at +2

  // Priority-based risk (high priority = more impact = higher risk)
  if (task.priority === "critical") risk += 1;
  else if (task.priority === "high") risk += 0.5;

  return Math.min(risk, 5); // Cap at 5
}

/**
 * Estimate success probability based on status and retry history
 */
function estimateSuccessProbability(task: InfraTask): number {
  if (task.status === "completed") return 95; // Already proven
  if (task.status === "vetoed") return 40; // Blocked for reason
  if (task.status === "in_progress") return 60; // Mid-flight
  if (task.status === "pending" && !task.retry_count) return 70; // Fresh attempt
  if (task.status === "pending" && task.retry_count > 0) return 35; // Multiple failures

  return 50; // Unknown
}

/**
 * Generate routing decision
 */
function makeRoutingDecision(task: InfraTask): RoutingDecision {
  const riskLevel = calculateRiskScore(task);
  const successProb = estimateSuccessProbability(task);

  let route: "green" | "yellow" | "red";
  let reason: string;

  // Green = low risk, high success probability
  if (task.status === "completed" && riskLevel <= 1) {
    route = "green";
    reason = "Completed task with no retries - proven baseline validator";
  }
  // Yellow = moderate risk or blocked (vetoed)
  else if (task.status === "vetoed" && !task.retry_count) {
    route = "yellow";
    reason = "Vetoed task - requires review of blocking condition before re-routing";
  }
  // Red = high risk, new, or multiple failures
  else if (riskLevel >= 3.5 || (task.retry_count && task.retry_count > 2)) {
    route = "red";
    reason = "High-risk task - hold until baseline established";
  }
  // Default to yellow for moderate cases
  else {
    route = "yellow";
    reason = "Moderate risk - review before execution";
  }

  return {
    taskId: task.id,
    route,
    reason,
    riskLevel: Math.round(riskLevel * 10) / 10,
    estimatedSuccess: successProb,
  };
}

/**
 * Main validation flow
 */
async function validateInfraRouting() {
  console.log("\n========================================");
  console.log("INFRASTRUCTURE ROUTING VALIDATOR");
  console.log("========================================\n");

  try {
    // Fetch the 3 identified lowest-risk infra tasks
    const { data: tasks, error: tasksError } = await supabase
      .from("todos")
      .select(
        "id, title, status, priority, task_category, retry_count, created_at"
      )
      .in("id", Object.values(BASELINE_INFRA_TASKS))
      .order("retry_count", { ascending: true });

    if (tasksError) {
      console.error("❌ Error fetching tasks:", tasksError.message);
      return;
    }

    if (!tasks || tasks.length === 0) {
      console.error("❌ No tasks found for validation");
      return;
    }

    // Generate routing decisions
    const decisions: RoutingDecision[] = tasks.map((task) =>
      makeRoutingDecision(task as InfraTask)
    );

    // Print results
    console.log("📊 INFRA CATEGORY BASELINE STATUS");
    console.log("-----------------------------------------");
    console.log("Total Infra Tasks: 3");
    console.log("Completed: 1 ✅");
    console.log("Vetoed: 2 ⛔");
    console.log("Pending: 0");
    console.log("Baseline Success Rate: 0% (undefined → establish via Task #1)\n");

    console.log("🎯 ROUTING DECISIONS");
    console.log("-----------------------------------------\n");

    // Group by route
    const green = decisions.filter((d) => d.route === "green");
    const yellow = decisions.filter((d) => d.route === "yellow");
    const red = decisions.filter((d) => d.route === "red");

    if (green.length > 0) {
      console.log("🟢 GREEN ROUTE (Execute Immediately):");
      green.forEach((dec, i) => {
        const task = tasks.find((t) => t.id === dec.taskId) as InfraTask;
        console.log(
          `  ${i + 1}. [${task.status.toUpperCase()}] ${task.title}`
        );
        console.log(`     Risk: ${dec.riskLevel}/5 | Success: ${dec.estimatedSuccess}%`);
        console.log(`     Reason: ${dec.reason}\n`);
      });
    }

    if (yellow.length > 0) {
      console.log("🟡 YELLOW ROUTE (Review Before Routing):");
      yellow.forEach((dec, i) => {
        const task = tasks.find((t) => t.id === dec.taskId) as InfraTask;
        console.log(
          `  ${i + 1}. [${task.status.toUpperCase()}] ${task.title}`
        );
        console.log(`     Risk: ${dec.riskLevel}/5 | Success: ${dec.estimatedSuccess}%`);
        console.log(`     Reason: ${dec.reason}\n`);
      });
    }

    if (red.length > 0) {
      console.log("🔴 RED ROUTE (Hold Until Baseline Confirmed):");
      red.forEach((dec, i) => {
        const task = tasks.find((t) => t.id === dec.taskId) as InfraTask;
        console.log(
          `  ${i + 1}. [${task.status.toUpperCase()}] ${task.title}`
        );
        console.log(`     Risk: ${dec.riskLevel}/5 | Success: ${dec.estimatedSuccess}%`);
        console.log(`     Reason: ${dec.reason}\n`);
      });
    }

    // Validation summary
    console.log("📈 ROUTING VALIDATION SUMMARY");
    console.log("-----------------------------------------");
    console.log(`Green (Safe to Execute): ${green.length}`);
    console.log(`Yellow (Review Needed): ${yellow.length}`);
    console.log(`Red (Hold for Now): ${red.length}`);
    console.log(
      `Average Risk Score: ${(decisions.reduce((sum, d) => sum + d.riskLevel, 0) / decisions.length).toFixed(2)}/5`
    );
    console.log(
      `Average Success Probability: ${Math.round(decisions.reduce((sum, d) => sum + d.estimatedSuccess, 0) / decisions.length)}%\n`
    );

    // Recommendations
    console.log("💡 RECOMMENDATIONS");
    console.log("-----------------------------------------");
    console.log("1. Execute Task #1 (Completed Curiosity) to establish baseline");
    console.log("2. Review veto reasons for Tasks #2-3 before re-routing");
    console.log("3. Update god_status.meta.categoryStats.infra after Task #1 execution");
    console.log("4. Target infra success rate: >80% (currently undefined)\n");

    console.log("========================================\n");
  } catch (error) {
    console.error("❌ Validation error:", error);
    process.exit(1);
  }
}

// Run validator
validateInfraRouting().then(() => {
  console.log("✅ Validation complete");
  process.exit(0);
});
