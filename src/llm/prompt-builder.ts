/**
 * Prompt builder - generates prompts from schemas
 */

import type { Schema } from '../schemas/types.js';

/**
 * Builds a system prompt for extraction
 */
export function buildSystemPrompt(schema: Schema): string {
    const { fields, metadata, confidence } = schema;

    let prompt = `You are a data extraction assistant. Extract structured data from the provided text according to the schema below.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON matching the schema
2. Include confidence scores (0-100) for each field, even if field is null
3. Do not include any explanation or markdown formatting
4. For optional fields: set value to null if not found or confidence too low
5. ALWAYS include ALL fields in confidenceByField, even if value is null

SCHEMA:
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
            prompt += ` - range: ${fieldDef.min ?? '−∞'} to ${fieldDef.max ?? '∞'}`;
        }
        if (fieldDef.pattern) {
            prompt += ` - pattern: ${fieldDef.pattern}`;
        }
    }

    // Add confidence requirements
    if (confidence) {
        prompt += `\n\nCONFIDENCE REQUIREMENTS:
- Minimum confidence threshold: ${confidence.threshold}%
- Provide per-field confidence scores in your response
`;
    }

    // Add response format
    prompt += `\n\nRESPONSE FORMAT:
{
  "data": {
    ${Object.keys(fields).map(name => `"${name}": <extracted_value_or_null>`).join(',\n    ')}
  },
  "confidence": <overall_confidence_0_to_100>,
  "confidenceByField": {
    ${Object.keys(fields).map(name => `"${name}": <confidence_0_to_100_or_0_if_not_found>`).join(',\n    ')}
  }
}

IMPORTANT: Include ALL fields in both data and confidenceByField. Use null for data and 0 for confidence if field not found or uncertain.`;

    return prompt;
}

/**
 * Builds a user prompt with input text
 */
export function buildUserPrompt(input: string): string {
    return `Extract data from the following text:\n\n${input}`;
}
