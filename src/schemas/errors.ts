/**
 * Schema validation errors and error codes
 */

export const ErrorCodes = {
  // Schema structure errors
  INVALID_JSON: 'INVALID_JSON',
  MISSING_FIELDS: 'MISSING_FIELDS',
  INVALID_FIELD_TYPE: 'INVALID_FIELD_TYPE',
  INVALID_FIELD_NAME: 'INVALID_FIELD_NAME',
  
  // Field constraint errors
  INVALID_ENUM_VALUE: 'INVALID_ENUM_VALUE',
  INVALID_CONSTRAINT: 'INVALID_CONSTRAINT',
  MISSING_ENUM_VALUES: 'MISSING_ENUM_VALUES',
  EMPTY_ENUM_VALUES: 'EMPTY_ENUM_VALUES',
  INVALID_PATTERN: 'INVALID_PATTERN',
  CONSTRAINT_MISMATCH: 'CONSTRAINT_MISMATCH',
  DUPLICATE_ENUM_VALUE: 'DUPLICATE_ENUM_VALUE',
  
  // Confidence-related errors
  CONFIDENCE_BELOW_THRESHOLD: 'CONFIDENCE_BELOW_THRESHOLD',
  INVALID_CONFIDENCE_CONFIG: 'INVALID_CONFIDENCE_CONFIG',
  MISSING_CONFIDENCE_SCORE: 'MISSING_CONFIDENCE_SCORE',
  INVALID_CONFIDENCE_SCORE: 'INVALID_CONFIDENCE_SCORE',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Custom error class for schema validation errors
 */
export class SchemaValidationError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public field?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SchemaValidationError';
    Object.setPrototypeOf(this, SchemaValidationError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      field: this.field,
      details: this.details,
    };
  }
}
