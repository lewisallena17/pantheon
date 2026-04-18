/**
 * Decision tree builder for schema-aware SELECT query routing.
 * 
 * Constructs a decision tree based on:
 * - Table existence and accessibility
 * - Column availability and type compatibility
 * - RLS policy presence
 * - User permissions (if context provided)
 * 
 * Used to validate queries before execution and route to appropriate handlers.
 */

import type { TableMetadata, ColumnMetadata } from './cache'

/**
 * Decision tree node types
 */
export type DecisionNodeType = 
  | 'table_exists'
  | 'has_columns'
  | 'type_compatible'
  | 'rls_check'
  | 'permission_check'
  | 'valid_route'
  | 'invalid_route'
  | 'requires_policy'

/**
 * Route decision metadata
 */
export interface RouteDecision {
  valid: boolean
  nodeType: DecisionNodeType
  message: string
  reason?: string
  missingElements?: string[]
  recommendedHandler?: string
  requiresPolicy?: boolean
}

/**
 * Column requirement specification
 */
export interface ColumnRequirement {
  name: string
  dataType?: string // Pattern match or specific type like 'text', 'uuid', 'boolean'
  nullable?: boolean
  required: boolean
}

/**
 * Table access rule
 */
export interface TableAccessRule {
  tableName: string
  requiredColumns?: ColumnRequirement[]
  allowedWithRLS?: boolean
  requiresPolicy?: boolean
  handler?: string
}

/**
 * Decision tree node for routing evaluation
 */
export interface DecisionNode {
  type: DecisionNodeType
  rule: TableAccessRule
  children?: DecisionNode[]
  handler?: string
  isTerminal: boolean
}

/**
 * Query context for decision evaluation
 */
export interface QueryContext {
  tableName: string
  selectedColumns?: string[]
  whereColumns?: string[]
  hasPolicy?: boolean
  userRole?: 'anon' | 'authenticated' | 'service'
}

/**
 * Build a decision tree for schema validation
 */
export function buildDecisionTree(
  tables: Record<string, TableMetadata>
): DecisionNode {
  const root: DecisionNode = {
    type: 'table_exists',
    rule: { tableName: '__root__' },
    isTerminal: false,
  }

  // Create decision nodes for each table
  root.children = Object.entries(tables).map(([tableName, metadata]) => {
    const tableNode: DecisionNode = {
      type: 'table_exists',
      rule: { tableName },
      isTerminal: false,
    }

    // Add RLS check node
    const rlsNode: DecisionNode = {
      type: 'rls_check',
      rule: {
        tableName,
        allowedWithRLS: true,
        requiresPolicy: metadata.has_rls,
      },
      isTerminal: false,
    }

    // Add column validation node
    const columnsNode: DecisionNode = {
      type: 'has_columns',
      rule: {
        tableName,
        requiredColumns: metadata.columns.map(col => ({
          name: col.column_name,
          dataType: col.data_type,
          nullable: col.is_nullable,
          required: !col.is_nullable && !col.column_default,
        })),
      },
      isTerminal: false,
    }

    // Add valid route terminal node
    const validNode: DecisionNode = {
      type: 'valid_route',
      rule: { tableName, handler: 'default_select_handler' },
      isTerminal: true,
      handler: 'default_select_handler',
    }

    // Connect nodes
    rlsNode.children = [columnsNode]
    columnsNode.children = [validNode]
    tableNode.children = [rlsNode]

    return tableNode
  })

  return root
}

/**
 * Evaluate a query against the decision tree
 */
export function evaluateDecisionTree(
  node: DecisionNode,
  context: QueryContext,
  tables: Record<string, TableMetadata>
): RouteDecision {
  // Check table existence
  if (!tables[context.tableName]) {
    return {
      valid: false,
      nodeType: 'invalid_route',
      message: `Table '${context.tableName}' does not exist`,
      reason: 'Table not found in schema',
    }
  }

  const tableMetadata = tables[context.tableName]

  // Check selected columns
  if (context.selectedColumns && context.selectedColumns.length > 0) {
    const invalidColumns = context.selectedColumns.filter(
      col => !tableMetadata.columns.some(c => c.column_name === col)
    )

    if (invalidColumns.length > 0) {
      return {
        valid: false,
        nodeType: 'invalid_route',
        message: `Invalid columns for table '${context.tableName}'`,
        missingElements: invalidColumns,
      }
    }
  }

  // Check WHERE clause columns
  if (context.whereColumns && context.whereColumns.length > 0) {
    const invalidColumns = context.whereColumns.filter(
      col => !tableMetadata.columns.some(c => c.column_name === col)
    )

    if (invalidColumns.length > 0) {
      return {
        valid: false,
        nodeType: 'invalid_route',
        message: `Invalid filter columns for table '${context.tableName}'`,
        missingElements: invalidColumns,
      }
    }
  }

  // Check RLS policy
  if (tableMetadata.has_rls && !context.hasPolicy) {
    return {
      valid: true,
      nodeType: 'valid_route',
      message: `Query on '${context.tableName}' requires RLS policy evaluation`,
      requiresPolicy: true,
      recommendedHandler: 'rls_aware_select_handler',
    }
  }

  // Valid query
  return {
    valid: true,
    nodeType: 'valid_route',
    message: `Query on '${context.tableName}' is valid`,
    recommendedHandler: 'default_select_handler',
  }
}

/**
 * Navigate decision tree for a specific query
 */
export function navigateDecisionTree(
  root: DecisionNode,
  context: QueryContext,
  tables: Record<string, TableMetadata>
): DecisionNode[] {
  const path: DecisionNode[] = [root]

  // Evaluate at each level
  const evaluation = evaluateDecisionTree(root, context, tables)

  // Find matching child nodes
  if (root.children) {
    for (const child of root.children) {
      if (child.rule.tableName === context.tableName || child.rule.tableName === '__root__') {
        path.push(child)

        // Continue navigation
        let current = child
        while (current.children && current.children.length > 0) {
          current = current.children[0]
          path.push(current)
        }

        break
      }
    }
  }

  return path
}

/**
 * Extract the final handler from decision path
 */
export function extractHandler(path: DecisionNode[]): string {
  const terminal = path[path.length - 1]
  return terminal.handler || 'default_select_handler'
}

/**
 * Debug: pretty-print decision tree
 */
export function printDecisionTree(node: DecisionNode, indent = 0): string {
  const prefix = '  '.repeat(indent)
  let output = `${prefix}[${node.type}] ${node.rule.tableName}\n`

  if (node.handler) {
    output += `${prefix}  → handler: ${node.handler}\n`
  }

  if (node.children) {
    for (const child of node.children) {
      output += printDecisionTree(child, indent + 1)
    }
  }

  return output
}

/**
 * Get all terminal nodes (valid routes) from tree
 */
export function getTerminalNodes(node: DecisionNode): DecisionNode[] {
  if (node.isTerminal) {
    return [node]
  }

  const terminals: DecisionNode[] = []
  if (node.children) {
    for (const child of node.children) {
      terminals.push(...getTerminalNodes(child))
    }
  }

  return terminals
}
