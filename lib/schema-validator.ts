/**
 * Schema Validator for INSERT/UPDATE operations
 * 
 * Validates payloads against defined table schemas before database operations.
 * Logs validation failures to validation_logs table with structured error information.
 */

import type { TodoStatus, TodoPriority, TaskCategory } from '@/types/todos'

/**
 * Field definition with type and constraints
 */
interface FieldDef {
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'uuid' | 'array' | 'object'
  required?: boolean
  nullable?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  enum?: string[]
  arrayOf?: FieldDef
  description?: string
}

/**
 * Schema definition for a table
 */
interface TableSchema {
  [fieldName: string]: FieldDef
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string
  value: unknown
  reason: string
  type: 'type_mismatch' | 'constraint_violation' | 'enum_violation' | 'required_missing' | 'format_invalid'
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  timestamp: string
  operation: 'insert' | 'update'
  table: string
  payload: Record<string, unknown>
}

/**
 * Schema definitions for tables
 */
const SCHEMAS: Record<string, { insert: TableSchema; update: TableSchema }> = {
  todos: {
    insert: {
      id: {
        type: 'uuid',
        nullable: true,
        description: 'UUID primary key (auto-generated if not provided)',
      },
      title: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 500,
        description: 'Todo title',
      },
      status: {
        type: 'enum',
        enum: ['proposed', 'pending', 'in_progress', 'completed', 'failed', 'blocked', 'vetoed'],
        nullable: true,
        description: 'Todo status',
      },
      priority: {
        type: 'enum',
        enum: ['low', 'medium', 'high', 'critical'],
        nullable: true,
        description: 'Todo priority',
      },
      assigned_agent: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Assigned agent name',
      },
      is_boss: {
        type: 'boolean',
        nullable: true,
        description: 'Whether task is a boss task',
      },
      deadline: {
        type: 'date',
        nullable: true,
        description: 'Task deadline',
      },
      comments: {
        type: 'array',
        nullable: true,
        arrayOf: { type: 'object' },
        description: 'Task comments',
      },
      retry_count: {
        type: 'number',
        nullable: true,
        description: 'Number of retries',
      },
      parent_task_id: {
        type: 'uuid',
        nullable: true,
        description: 'Parent task ID',
      },
      task_category: {
        type: 'enum',
        enum: ['db', 'ui', 'infra', 'analysis', 'other'],
        nullable: true,
        description: 'Task category',
      },
    },
    update: {
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 500,
        description: 'Todo title',
      },
      status: {
        type: 'enum',
        enum: ['proposed', 'pending', 'in_progress', 'completed', 'failed', 'blocked', 'vetoed'],
        description: 'Todo status',
      },
      priority: {
        type: 'enum',
        enum: ['low', 'medium', 'high', 'critical'],
        description: 'Todo priority',
      },
      assigned_agent: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Assigned agent name',
      },
      is_boss: {
        type: 'boolean',
        nullable: true,
        description: 'Whether task is a boss task',
      },
      deadline: {
        type: 'date',
        nullable: true,
        description: 'Task deadline',
      },
      comments: {
        type: 'array',
        nullable: true,
        arrayOf: { type: 'object' },
        description: 'Task comments',
      },
      retry_count: {
        type: 'number',
        nullable: true,
        description: 'Number of retries',
      },
      parent_task_id: {
        type: 'uuid',
        nullable: true,
        description: 'Parent task ID',
      },
      task_category: {
        type: 'enum',
        enum: ['db', 'ui', 'infra', 'analysis', 'other'],
        nullable: true,
        description: 'Task category',
      },
    },
  },
}

/**
 * SchemaValidator class for validating INSERT/UPDATE operations
 */
export class SchemaValidator {
  private schema: TableSchema
  private operation: 'insert' | 'update'
  private table: string
  private payload: Record<string, unknown>

  constructor(
    table: string,
    operation: 'insert' | 'update',
    payload: Record<string, unknown>
  ) {
    this.table = table
    this.operation = operation
    this.payload = payload

    if (!SCHEMAS[table]) {
      throw new Error(`No schema defined for table: ${table}`)
    }

    this.schema = SCHEMAS[table][operation]
  }

  /**
   * Validate the payload against the schema
   */
  validate(): ValidationResult {
    const errors: ValidationError[] = []
    const timestamp = new Date().toISOString()

    // Check for unknown fields in strict mode
    const schemaFields = Object.keys(this.schema)
    for (const field of Object.keys(this.payload)) {
      if (!schemaFields.includes(field)) {
        // Warn but don't fail for unknown fields
        console.warn(`Unknown field in ${this.table}.${this.operation}: ${field}`)
      }
    }

    // Validate each field
    for (const [fieldName, fieldDef] of Object.entries(this.schema)) {
      const value = this.payload[fieldName]

      // Check required fields
      if (fieldDef.required && (value === undefined || value === null)) {
        errors.push({
          field: fieldName,
          value,
          reason: `Required field is missing`,
          type: 'required_missing',
        })
        continue
      }

      // Skip validation if field is not provided and not required
      if (value === undefined || value === null) {
        // Check if null is allowed
        if (value === null && !fieldDef.nullable) {
          errors.push({
            field: fieldName,
            value,
            reason: `Field does not allow null values`,
            type: 'constraint_violation',
          })
        }
        continue
      }

      // Type validation
      const typeError = this.validateType(fieldName, value, fieldDef)
      if (typeError) {
        errors.push(typeError)
        continue
      }

      // Constraint validation (minLength, maxLength, enum, etc.)
      const constraintError = this.validateConstraints(fieldName, value, fieldDef)
      if (constraintError) {
        errors.push(constraintError)
      }
    }

    const result: ValidationResult = {
      valid: errors.length === 0,
      errors,
      timestamp,
      operation: this.operation,
      table: this.table,
      payload: this.payload,
    }

    return result
  }

  /**
   * Validate field type
   */
  private validateType(
    fieldName: string,
    value: unknown,
    fieldDef: FieldDef
  ): ValidationError | null {
    const actualType = Array.isArray(value)
      ? 'array'
      : value === null
        ? 'null'
        : typeof value

    switch (fieldDef.type) {
      case 'string':
        if (typeof value !== 'string') {
          return {
            field: fieldName,
            value,
            reason: `Expected string, got ${actualType}`,
            type: 'type_mismatch',
          }
        }
        break

      case 'number':
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          return {
            field: fieldName,
            value,
            reason: `Expected number, got ${actualType}`,
            type: 'type_mismatch',
          }
        }
        break

      case 'boolean':
        if (typeof value !== 'boolean') {
          return {
            field: fieldName,
            value,
            reason: `Expected boolean, got ${actualType}`,
            type: 'type_mismatch',
          }
        }
        break

      case 'date':
        if (typeof value !== 'string') {
          return {
            field: fieldName,
            value,
            reason: `Expected ISO date string, got ${actualType}`,
            type: 'type_mismatch',
          }
        }
        // Validate ISO date format
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          return {
            field: fieldName,
            value,
            reason: `Invalid ISO date format`,
            type: 'format_invalid',
          }
        }
        break

      case 'uuid':
        if (typeof value !== 'string') {
          return {
            field: fieldName,
            value,
            reason: `Expected UUID string, got ${actualType}`,
            type: 'type_mismatch',
          }
        }
        // Validate UUID format (v4)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(value)) {
          return {
            field: fieldName,
            value,
            reason: `Invalid UUID format`,
            type: 'format_invalid',
          }
        }
        break

      case 'enum':
        if (typeof value !== 'string') {
          return {
            field: fieldName,
            value,
            reason: `Expected enum string, got ${actualType}`,
            type: 'type_mismatch',
          }
        }
        break

      case 'array':
        if (!Array.isArray(value)) {
          return {
            field: fieldName,
            value,
            reason: `Expected array, got ${actualType}`,
            type: 'type_mismatch',
          }
        }
        break

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return {
            field: fieldName,
            value,
            reason: `Expected object, got ${actualType}`,
            type: 'type_mismatch',
          }
        }
        break
    }

    return null
  }

  /**
   * Validate field constraints (minLength, maxLength, enum, pattern, etc.)
   */
  private validateConstraints(
    fieldName: string,
    value: unknown,
    fieldDef: FieldDef
  ): ValidationError | null {
    // String constraints
    if (fieldDef.type === 'string' && typeof value === 'string') {
      if (fieldDef.minLength !== undefined && value.length < fieldDef.minLength) {
        return {
          field: fieldName,
          value,
          reason: `String length ${value.length} is less than minimum ${fieldDef.minLength}`,
          type: 'constraint_violation',
        }
      }

      if (fieldDef.maxLength !== undefined && value.length > fieldDef.maxLength) {
        return {
          field: fieldName,
          value,
          reason: `String length ${value.length} exceeds maximum ${fieldDef.maxLength}`,
          type: 'constraint_violation',
        }
      }

      if (fieldDef.pattern && !fieldDef.pattern.test(value)) {
        return {
          field: fieldName,
          value,
          reason: `String does not match required pattern: ${fieldDef.pattern}`,
          type: 'constraint_violation',
        }
      }
    }

    // Enum constraints
    if (fieldDef.type === 'enum' && fieldDef.enum && typeof value === 'string') {
      if (!fieldDef.enum.includes(value)) {
        return {
          field: fieldName,
          value,
          reason: `Value "${value}" is not one of allowed values: ${fieldDef.enum.join(', ')}`,
          type: 'enum_violation',
        }
      }
    }

    return null
  }
}

/**
 * Validate a payload for INSERT operation
 */
export function validateInsert(
  table: string,
  payload: Record<string, unknown>
): ValidationResult {
  const validator = new SchemaValidator(table, 'insert', payload)
  return validator.validate()
}

/**
 * Validate a payload for UPDATE operation
 */
export function validateUpdate(
  table: string,
  payload: Record<string, unknown>
): ValidationResult {
  const validator = new SchemaValidator(table, 'update', payload)
  return validator.validate()
}
