/**
 * Type definitions for Anthropic Docs MCP Server
 */

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ClaudeModel {
  name: string;
  apiId: string;
  alias: string;
  tier: "flagship" | "balanced" | "fast";
  releaseDate: string;
  knowledgeCutoff: string;
  contextWindow: number;
  contextWindowExtended?: number;
  maxOutput: number;
  pricing: ModelPricing;
  features: string[];
}

export interface ModelPricing {
  input: number;
  output: number;
  cacheWrite5min?: number;
  cacheWrite1hr?: number;
  cacheRead?: number;
  longContextInput?: number;
  longContextOutput?: number;
  batchDiscount: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// THINKING CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface ThinkingConfig {
  minBudget: number;
  recommendedStart: number;
  largeBudgetThreshold: number;
  maxWithInterleaved: number;
  rules: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// BETA HEADERS
// ═══════════════════════════════════════════════════════════════════════════════

export interface BetaHeader {
  name: string;
  value: string;
  purpose: string;
  requiredFor: string;
  models?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// API MODES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ApiMode {
  name: string;
  function: string;
  apiCall: string;
  betaHeaders: string[];
  maxOutput: number;
  thinkingBudgetRule: string;
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTATION SECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type DocSection = 
  | "models"
  | "pricing"
  | "tokens"
  | "thinking"
  | "context"
  | "beta_headers"
  | "api_modes"
  | "best_practices"
  | "all";

export interface DocQuery {
  section?: DocSection;
  model?: string;
  topic?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE FORMATS
// ═══════════════════════════════════════════════════════════════════════════════

export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

export interface SearchResult {
  section: string;
  content: string;
  relevance: number;
}

export interface DocsResponse {
  query: string;
  results: SearchResult[];
  timestamp: string;
}
