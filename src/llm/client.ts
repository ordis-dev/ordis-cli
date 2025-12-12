/**
 * LLM client - universal client for OpenAI-compatible APIs
 */

import type {
    LLMConfig,
    LLMRequest,
    LLMResponse,
    ExtractionOptions,
    ExtractionResponse,
} from './types.js';
import { LLMError, LLMErrorCodes, type LLMErrorCode } from './errors.js';
import { buildSystemPrompt, buildUserPrompt } from './prompt-builder.js';

export class LLMClient {
    private config: LLMConfig & {
        temperature: number;
        maxTokens: number;
        timeout: number;
    };

    constructor(config: LLMConfig) {
        this.config = {
            temperature: 0.0,
            maxTokens: 2000,
            timeout: 30000,
            ...config,
        };
    }

    /**
     * Extracts data from text using schema
     */
    async extract(options: ExtractionOptions): Promise<ExtractionResponse> {
        const { schema, input, systemPrompt } = options;

        // Build prompts
        const system = systemPrompt || buildSystemPrompt(schema);
        const user = buildUserPrompt(input);

        // Create request
        const request: LLMRequest = {
            model: this.config.model,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user },
            ],
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
        };

        // Call API
        const response = await this.chat(request);

        // Parse response
        return this.parseExtractionResponse(response);
    }

    /**
     * Calls chat completion API
     */
    async chat(request: LLMRequest): Promise<LLMResponse> {
        const url = `${this.config.baseURL}/chat/completions`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
                },
                body: JSON.stringify(request),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            const data = await response.json();
            return data as LLMResponse;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof LLMError) {
                throw error;
            }

            if ((error as Error).name === 'AbortError') {
                throw new LLMError(
                    `Request timeout after ${this.config.timeout}ms`,
                    LLMErrorCodes.TIMEOUT
                );
            }

            throw new LLMError(
                `Network error: ${(error as Error).message}`,
                LLMErrorCodes.NETWORK_ERROR,
                undefined,
                { originalError: (error as Error).message }
            );
        }
    }

    /**
     * Handles error responses from API
     */
    private async handleErrorResponse(response: Response): Promise<never> {
        const status = response.status;
        let errorMessage = `API error: ${status} ${response.statusText}`;
        let errorCode: LLMErrorCode = LLMErrorCodes.API_ERROR;

        try {
            const errorData = await response.json() as { error?: { message?: string } };
            errorMessage = errorData.error?.message || errorMessage;
        } catch {
            // If we can't parse error JSON, use status text
        }

        if (status === 401 || status === 403) {
            errorCode = LLMErrorCodes.AUTHENTICATION_ERROR;
        } else if (status === 429) {
            errorCode = LLMErrorCodes.RATE_LIMIT;
        }

        throw new LLMError(errorMessage, errorCode, status);
    }

    /**
     * Parses extraction response from LLM
     */
    private parseExtractionResponse(response: LLMResponse): ExtractionResponse {
        if (!response.choices || response.choices.length === 0) {
            throw new LLMError(
                'No choices in LLM response',
                LLMErrorCodes.INVALID_RESPONSE
            );
        }

        const message = response.choices[0].message;
        if (!message || !message.content) {
            throw new LLMError(
                'No content in LLM response',
                LLMErrorCodes.INVALID_RESPONSE
            );
        }

        let content = message.content.trim();

        // Remove markdown code blocks if present
        if (content.startsWith('```json')) {
            content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (content.startsWith('```')) {
            content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        try {
            const parsed = JSON.parse(content);

            if (!parsed.data || typeof parsed.data !== 'object') {
                throw new Error('Response missing data object');
            }

            if (typeof parsed.confidence !== 'number') {
                throw new Error('Response missing confidence score');
            }

            if (!parsed.confidenceByField || typeof parsed.confidenceByField !== 'object') {
                throw new Error('Response missing confidenceByField object');
            }

            return {
                data: parsed.data,
                confidence: parsed.confidence,
                confidenceByField: parsed.confidenceByField,
            };
        } catch (error) {
            throw new LLMError(
                `Failed to parse LLM response: ${(error as Error).message}`,
                LLMErrorCodes.INVALID_RESPONSE,
                undefined,
                { content, error: (error as Error).message }
            );
        }
    }
}

/**
 * Creates LLM client with common configurations
 */
export function createLLMClient(config: LLMConfig): LLMClient {
    return new LLMClient(config);
}

/**
 * Preset configurations for popular providers
 */
export const LLMPresets = {
    ollama: (model: string = 'llama3'): LLMConfig => ({
        baseURL: 'http://localhost:11434/v1',
        model,
    }),

    lmStudio: (model: string = 'local-model'): LLMConfig => ({
        baseURL: 'http://localhost:1234/v1',
        model,
    }),

    openai: (apiKey: string, model: string = 'gpt-4o-mini'): LLMConfig => ({
        baseURL: 'https://api.openai.com/v1',
        apiKey,
        model,
    }),

    openrouter: (apiKey: string, model: string = 'openai/gpt-4o-mini'): LLMConfig => ({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey,
        model,
    }),
};
