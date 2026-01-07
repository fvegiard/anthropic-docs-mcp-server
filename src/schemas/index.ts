/**
 * Zod schemas for Anthropic Docs MCP Server
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE FORMAT SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

export const ResponseFormatSchema = z.enum(["markdown", "json"]).default("markdown");

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL QUERY SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const GetModelInfoSchema = z.object({
  model: z.enum(["opus_4_5", "sonnet_4_5", "haiku_4_5", "all"])
    .default("all")
    .describe("Model to get info for: opus_4_5, sonnet_4_5, haiku_4_5, or 'all' for all models"),
  response_format: ResponseFormatSchema
    .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable")
}).strict();

export type GetModelInfoInput = z.infer<typeof GetModelInfoSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING QUERY SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const GetPricingSchema = z.object({
  model: z.enum(["opus_4_5", "sonnet_4_5", "haiku_4_5", "all"])
    .default("all")
    .describe("Model to get pricing for"),
  include_discounts: z.boolean()
    .default(true)
    .describe("Include cache and batch discount information"),
  response_format: ResponseFormatSchema
}).strict();

export type GetPricingInput = z.infer<typeof GetPricingSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// TOKEN LIMITS SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const GetTokenLimitsSchema = z.object({
  model: z.enum(["opus_4_5", "sonnet_4_5", "haiku_4_5", "all"])
    .default("all")
    .describe("Model to get token limits for"),
  response_format: ResponseFormatSchema
}).strict();

export type GetTokenLimitsInput = z.infer<typeof GetTokenLimitsSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// THINKING CONFIG SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const GetThinkingConfigSchema = z.object({
  include_rules: z.boolean()
    .default(true)
    .describe("Include detailed rules about thinking budget"),
  include_api_modes: z.boolean()
    .default(true)
    .describe("Include API mode comparisons"),
  response_format: ResponseFormatSchema
}).strict();

export type GetThinkingConfigInput = z.infer<typeof GetThinkingConfigSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// BETA HEADERS SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const GetBetaHeadersSchema = z.object({
  response_format: ResponseFormatSchema
}).strict();

export type GetBetaHeadersInput = z.infer<typeof GetBetaHeadersSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH DOCS SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const SearchDocsSchema = z.object({
  query: z.string()
    .min(2, "Query must be at least 2 characters")
    .max(200, "Query must not exceed 200 characters")
    .describe("Search query to find relevant documentation"),
  response_format: ResponseFormatSchema
}).strict();

export type SearchDocsInput = z.infer<typeof SearchDocsSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// COST CALCULATOR SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const CalculateCostSchema = z.object({
  model: z.enum(["opus_4_5", "sonnet_4_5", "haiku_4_5"])
    .describe("Model to calculate cost for"),
  input_tokens: z.number()
    .int()
    .min(0)
    .describe("Number of input tokens"),
  output_tokens: z.number()
    .int()
    .min(0)
    .describe("Number of output tokens (includes thinking tokens if applicable)"),
  thinking_tokens: z.number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of thinking tokens (counted as output tokens)"),
  use_cache: z.boolean()
    .default(false)
    .describe("Whether using prompt caching"),
  cache_hit_ratio: z.number()
    .min(0)
    .max(1)
    .default(0.9)
    .describe("Ratio of cache hits (0-1)"),
  use_batch: z.boolean()
    .default(false)
    .describe("Whether using batch API (50% discount)"),
  long_context: z.boolean()
    .default(false)
    .describe("Whether using >200K context (premium pricing)"),
  response_format: ResponseFormatSchema
}).strict();

export type CalculateCostInput = z.infer<typeof CalculateCostSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// BEST PRACTICES SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

export const GetBestPracticesSchema = z.object({
  topic: z.enum(["thinking", "model_selection", "cost_optimization", "context_management", "all"])
    .default("all")
    .describe("Topic to get best practices for"),
  response_format: ResponseFormatSchema
}).strict();

export type GetBestPracticesInput = z.infer<typeof GetBestPracticesSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// FULL DOCS SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

export const GetFullDocsSchema = z.object({
  response_format: ResponseFormatSchema
}).strict();

export type GetFullDocsInput = z.infer<typeof GetFullDocsSchema>;
