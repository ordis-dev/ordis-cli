/**
 * Tests for programmatic API imports
 */

import { describe, it, expect } from 'vitest';

describe('Programmatic API', () => {
    describe('Core exports', () => {
        it('should export extract function', async () => {
            const { extract } = await import('../index.js');
            expect(extract).toBeDefined();
            expect(typeof extract).toBe('function');
        });

        it('should export ExtractionPipeline class', async () => {
            const { ExtractionPipeline } = await import('../index.js');
            expect(ExtractionPipeline).toBeDefined();
            expect(typeof ExtractionPipeline).toBe('function');
        });

        it('should export validateExtractedData', async () => {
            const { validateExtractedData } = await import('../index.js');
            expect(validateExtractedData).toBeDefined();
            expect(typeof validateExtractedData).toBe('function');
        });

        it('should export PipelineError', async () => {
            const { PipelineError, PipelineErrorCodes } = await import('../index.js');
            expect(PipelineError).toBeDefined();
            expect(PipelineErrorCodes).toBeDefined();
        });
    });

    describe('Schema exports', () => {
        it('should export loadSchema function', async () => {
            const { loadSchema } = await import('../index.js');
            expect(loadSchema).toBeDefined();
            expect(typeof loadSchema).toBe('function');
        });

        it('should export parseSchema function', async () => {
            const { parseSchema } = await import('../index.js');
            expect(parseSchema).toBeDefined();
            expect(typeof parseSchema).toBe('function');
        });

        it('should export validateSchema function', async () => {
            const { validateSchema } = await import('../index.js');
            expect(validateSchema).toBeDefined();
            expect(typeof validateSchema).toBe('function');
        });

        it('should export SchemaValidationError', async () => {
            const { SchemaValidationError, SchemaErrorCodes } = await import('../index.js');
            expect(SchemaValidationError).toBeDefined();
            expect(SchemaErrorCodes).toBeDefined();
        });
    });

    describe('LLM exports', () => {
        it('should export LLMClient class', async () => {
            const { LLMClient } = await import('../index.js');
            expect(LLMClient).toBeDefined();
            expect(typeof LLMClient).toBe('function');
        });

        it('should export createLLMClient function', async () => {
            const { createLLMClient } = await import('../index.js');
            expect(createLLMClient).toBeDefined();
            expect(typeof createLLMClient).toBe('function');
        });

        it('should export LLMPresets', async () => {
            const { LLMPresets } = await import('../index.js');
            expect(LLMPresets).toBeDefined();
            expect(LLMPresets.ollama).toBeDefined();
            expect(LLMPresets.lmStudio).toBeDefined();
            expect(LLMPresets.openai).toBeDefined();
        });

        it('should export buildSystemPrompt function', async () => {
            const { buildSystemPrompt } = await import('../index.js');
            expect(buildSystemPrompt).toBeDefined();
            expect(typeof buildSystemPrompt).toBe('function');
        });

        it('should export LLMError', async () => {
            const { LLMError, LLMErrorCodes } = await import('../index.js');
            expect(LLMError).toBeDefined();
            expect(LLMErrorCodes).toBeDefined();
        });
    });

    describe('End-to-end library usage', () => {
        it('should support basic extraction workflow', async () => {
            const { loadSchemaFromObject, extract } = await import('../index.js');

            const schema = loadSchemaFromObject({
                fields: {
                    name: { type: 'string' },
                    amount: { type: 'number' }
                }
            });

            expect(schema).toBeDefined();
            expect(schema.fields).toBeDefined();
            expect(schema.fields.name).toBeDefined();
            expect(schema.fields.amount).toBeDefined();
        });
    });
});
