/**
 * Prompt builder - generates prompts from schemas
 */

import type { Schema } from '../schemas/types.js';

/**
 * Builds a system prompt for extraction
 */
export function buildSystemPrompt(schema: Schema): string {
    const { fields, metadata, confidence } = schema;

    let prompt = `You are a structured data extraction system. Extract information from text according to the schema below.

Rules:
- Return only valid JSON (no markdown, no explanation)
- Include a confidence score (0-100) for each field
- Use null for missing or uncertain values
- Include all fields in the response, even if null

Schema:
`;

    // Add field definitions
    for (const [fieldName, fieldDef] of Object.entries(fields)) {
        prompt += `\n- ${fieldName}: ${fieldDef.type}`;
        if (fieldDef.optional) {
            prompt += ' (optional)';
        }
        if (fieldDef.description) {
            prompt += ` - ${fieldDef.description}`;
        }
        if (fieldDef.enum) {
            prompt += ` - allowed values: ${fieldDef.enum.join(', ')}`;
        }
        if (fieldDef.min !== undefined || fieldDef.max !== undefined) {
            const min = fieldDef.min !== undefined ? fieldDef.min : 'null';
            const max = fieldDef.max !== undefined ? fieldDef.max : 'null';
            prompt += ` - range: ${min} to ${max}`;
        }
        if (fieldDef.pattern) {
            prompt += ` - pattern: ${fieldDef.pattern}`;
        }
    }

    // Add confidence requirements
    if (confidence) {
        prompt += `\n\nConfidence threshold: ${confidence.threshold}% (extractions below this may be rejected)`;
    }

    // Add response format with concrete example
    const exampleFields = Object.keys(fields).slice(0, 2);
    const field1 = exampleFields[0] || 'field1';
    const field2 = exampleFields[1] || 'field2';
    
    prompt += `\n\nResponse format:
{
  "data": {
    "${field1}": "extracted value or null",
    "${field2}": 42,
    ...
  },
  "confidence": 85,
  "confidenceByField": {
    "${field1}": 90,
    "${field2}": 80,
    ...
  }
}`;

    return prompt;
}

/**
 * Builds a user prompt with input text
 */
export function buildUserPrompt(input: string): string {
    return `Extract data from the following text:\n\n${input}`;
}
