/**
 * Schema loader - loads and parses schema files
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { Schema } from './types.js';
import { validateSchema } from './validator.js';
import { SchemaValidationError, ErrorCodes } from './errors.js';

/**
 * Loads a schema from a file path
 * 
 * @param filePath - Path to the schema JSON file
 * @returns Validated schema object
 * @throws {SchemaValidationError} If the file cannot be read or schema is invalid
 */
export async function loadSchema(filePath: string): Promise<Schema> {
    try {
        // Check if file exists and is readable
        await fs.access(filePath, fs.constants.R_OK);
    } catch (error) {
        throw new SchemaValidationError(
            `Cannot read schema file: ${filePath}`,
            ErrorCodes.INVALID_JSON,
            undefined,
            { filePath, error: (error as Error).message }
        );
    }

    // Read file content
    let content: string;
    try {
        content = await fs.readFile(filePath, 'utf-8');
    } catch (error) {
        throw new SchemaValidationError(
            `Failed to read schema file: ${(error as Error).message}`,
            ErrorCodes.INVALID_JSON,
            undefined,
            { filePath }
        );
    }

    // Parse JSON
    let schema: unknown;
    try {
        schema = JSON.parse(content);
    } catch (error) {
        throw new SchemaValidationError(
            `Invalid JSON in schema file: ${(error as Error).message}`,
            ErrorCodes.INVALID_JSON,
            undefined,
            { filePath }
        );
    }

    // Validate schema structure
    validateSchema(schema);

    return schema;
}

/**
 * Parses a schema from a JSON string
 * 
 * @param jsonString - JSON string containing the schema
 * @returns Validated schema object
 * @throws {SchemaValidationError} If the JSON is invalid or schema is malformed
 */
export function parseSchema(jsonString: string): Schema {
    let schema: unknown;

    try {
        schema = JSON.parse(jsonString);
    } catch (error) {
        throw new SchemaValidationError(
            `Invalid JSON: ${(error as Error).message}`,
            ErrorCodes.INVALID_JSON
        );
    }

    validateSchema(schema);
    return schema;
}

/**
 * Loads a schema from an object (useful for testing or programmatic usage)
 * 
 * @param obj - Schema object
 * @returns Validated schema object
 * @throws {SchemaValidationError} If the schema is invalid
 */
export function loadSchemaFromObject(obj: unknown): Schema {
    validateSchema(obj);
    return obj;
}
