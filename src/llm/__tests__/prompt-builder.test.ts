/**
 * Tests for prompt builder
 */

import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildUserPrompt } from '../prompt-builder.js';
import type { Schema } from '../../schemas/types.js';

describe('Prompt Builder', () => {
    describe('buildSystemPrompt', () => {
        it('should build basic system prompt', () => {
            const schema: Schema = {
                fields: {
                    name: { type: 'string' },
                    age: { type: 'number' },
                },
            };

            const prompt = buildSystemPrompt(schema);

            expect(prompt).toContain('data extraction');
            expect(prompt).toContain('name: string');
            expect(prompt).toContain('age: number');
            expect(prompt).toContain('ONLY valid JSON');
        });

        it('should include field descriptions', () => {
            const schema: Schema = {
                fields: {
                    email: {
                        type: 'string',
                        description: 'User email address',
                    },
                },
            };

            const prompt = buildSystemPrompt(schema);

            expect(prompt).toContain('User email address');
        });

        it('should mark optional fields', () => {
            const schema: Schema = {
                fields: {
                    name: { type: 'string' },
                    nickname: { type: 'string', optional: true },
                },
            };

            const prompt = buildSystemPrompt(schema);

            expect(prompt).toContain('nickname: string (optional)');
        });

        it('should include enum values', () => {
            const schema: Schema = {
                fields: {
                    status: {
                        type: 'enum',
                        enum: ['active', 'inactive', 'pending'],
                    },
                },
            };

            const prompt = buildSystemPrompt(schema);

            expect(prompt).toContain('active, inactive, pending');
        });

        it('should include number constraints', () => {
            const schema: Schema = {
                fields: {
                    age: { type: 'number', min: 0, max: 120 },
                },
            };

            const prompt = buildSystemPrompt(schema);

            expect(prompt).toContain('range: 0 to 120');
        });

        it('should include pattern for strings', () => {
            const schema: Schema = {
                fields: {
                    zipcode: {
                        type: 'string',
                        pattern: '^\\d{5}$',
                    },
                },
            };

            const prompt = buildSystemPrompt(schema);

            expect(prompt).toContain('pattern: ^\\d{5}$');
        });

        it('should include confidence requirements', () => {
            const schema: Schema = {
                fields: {
                    name: { type: 'string' },
                },
                confidence: {
                    threshold: 85,
                    failOnLowConfidence: true,
                },
            };

            const prompt = buildSystemPrompt(schema);

            expect(prompt).toContain('threshold: 85%');
            expect(prompt).toContain('per-field confidence');
        });

        it('should include response format', () => {
            const schema: Schema = {
                fields: {
                    id: { type: 'string' },
                    count: { type: 'number' },
                },
            };

            const prompt = buildSystemPrompt(schema);

            expect(prompt).toContain('"data"');
            expect(prompt).toContain('"confidence"');
            expect(prompt).toContain('"confidenceByField"');
        });
    });

    describe('buildUserPrompt', () => {
        it('should wrap input text', () => {
            const input = 'Name: John Doe\nAge: 30';
            const prompt = buildUserPrompt(input);

            expect(prompt).toContain('Extract data');
            expect(prompt).toContain(input);
        });

        it('should handle multiline input', () => {
            const input = 'Line 1\nLine 2\nLine 3';
            const prompt = buildUserPrompt(input);

            expect(prompt).toContain(input);
        });
    });
});
