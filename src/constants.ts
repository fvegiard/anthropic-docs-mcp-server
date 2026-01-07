/**
 * Anthropic Claude 4.5 Documentation Constants
 * Updated: January 2026
 * 
 * This file contains all the official specifications for Claude 4.5 models
 * including pricing, token limits, and configuration options.
 */

import type { ClaudeModel, ThinkingConfig, BetaHeader, ApiMode } from "./types.js";

// ═══════════════════════════════════════════════════════════════════════════════
// CLAUDE 4.5 MODELS
// ═══════════════════════════════════════════════════════════════════════════════

export const CLAUDE_MODELS: Record<string, ClaudeModel> = {
  opus_4_5: {
    name: "Claude Opus 4.5",
    apiId: "claude-opus-4-5-20251101",
    alias: "claude-opus-4-5",
    tier: "flagship",
    releaseDate: "2025-11-24",
    knowledgeCutoff: "March 2025",
    contextWindow: 200_000,
    maxOutput: 64_000,
    pricing: {
      input: 5.00,
      output: 25.00,
      cacheWrite5min: 6.25,
      cacheWrite1hr: 10.00,
      cacheRead: 0.50,
      batchDiscount: "50%"
    },
    features: [
      "Extended thinking (preserved across turns by default)",
      "Effort parameter (low/medium/high)",
      "Computer use + zoom tool",
      "Context awareness",
      "Vision (images, PDFs, spreadsheets)",
      "Best-in-class coding (80.9% SWE-bench Verified)",
      "Memory tool for persistent state",
      "Context compaction"
    ]
  },
  
  sonnet_4_5: {
    name: "Claude Sonnet 4.5",
    apiId: "claude-sonnet-4-5-20250929",
    alias: "claude-sonnet-4-5",
    tier: "balanced",
    releaseDate: "2025-09-29",
    knowledgeCutoff: "January 2025",
    contextWindow: 200_000,
    contextWindowExtended: 1_000_000,
    maxOutput: 64_000,
    pricing: {
      input: 3.00,
      output: 15.00,
      cacheWrite5min: 3.75,
      cacheWrite1hr: 6.00,
      cacheRead: 0.30,
      longContextInput: 6.00,
      longContextOutput: 22.50,
      batchDiscount: "50%"
    },
    features: [
      "Extended thinking",
      "1M context window (beta, tier 4+)",
      "Computer use",
      "Context awareness",
      "Vision",
      "77.2% SWE-bench Verified",
      "Best balance of speed/cost/quality"
    ]
  },
  
  haiku_4_5: {
    name: "Claude Haiku 4.5",
    apiId: "claude-haiku-4-5-20251001",
    alias: "claude-haiku-4-5",
    tier: "fast",
    releaseDate: "2025-10-15",
    knowledgeCutoff: "February 2025",
    contextWindow: 200_000,
    maxOutput: 64_000,
    pricing: {
      input: 1.00,
      output: 5.00,
      cacheWrite5min: 1.25,
      cacheWrite1hr: 2.00,
      cacheRead: 0.10,
      batchDiscount: "50%"
    },
    features: [
      "Extended thinking",
      "Computer use",
      "Context awareness",
      "Vision",
      "73.3% SWE-bench Verified",
      "4-5x faster than Sonnet 4.5",
      "Best for high-volume, latency-sensitive tasks"
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXTENDED THINKING CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const THINKING_CONFIG: ThinkingConfig = {
  minBudget: 1_024,
  recommendedStart: 16_000,
  largeBudgetThreshold: 32_000,
  maxWithInterleaved: 200_000,
  rules: [
    "budget_tokens must be at least 1,024",
    "Standard mode: budget_tokens must be LESS than max_tokens",
    "Interleaved mode with tools: budget_tokens can EXCEED max_tokens (uses full context window)",
    "Thinking tokens are billed as OUTPUT tokens",
    "Previous thinking blocks are auto-stripped from context (except Opus 4.5 which preserves them by default)",
    "For budgets above 32K, use batch processing to avoid networking issues",
    "Opus 4.5 preserves thinking blocks across turns for better multi-step reasoning"
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// BETA HEADERS
// ═══════════════════════════════════════════════════════════════════════════════

export const BETA_HEADERS: BetaHeader[] = [
  {
    name: "Interleaved Thinking",
    value: "interleaved-thinking-2025-05-14",
    purpose: "Enable thinking between tool calls",
    requiredFor: "Extended thinking WITH tools (uses beta.messages.create)"
  },
  {
    name: "Context Management",
    value: "context-management-2025-06-27",
    purpose: "Auto-compaction when approaching context limits",
    requiredFor: "Long-running agent sessions, automatic context management"
  },
  {
    name: "Long Context (1M)",
    value: "context-1m-2025-08-07",
    purpose: "Enable 1 million token context window",
    requiredFor: "Processing very large documents or codebases",
    models: ["claude-sonnet-4-5-20250929", "claude-sonnet-4-20250514"]
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// API MODES
// ═══════════════════════════════════════════════════════════════════════════════

export const API_MODES: ApiMode[] = [
  {
    name: "Standard",
    function: "chat()",
    apiCall: "anthropic.messages.create()",
    betaHeaders: [],
    maxOutput: 64_000,
    thinkingBudgetRule: "N/A - no thinking",
    description: "Regular chat without extended thinking. Use for simple queries and conversations."
  },
  {
    name: "Extended Thinking",
    function: "chatWithThinking()",
    apiCall: "anthropic.messages.create()",
    betaHeaders: [],
    maxOutput: 64_000,
    thinkingBudgetRule: "budget_tokens < max_tokens",
    description: "Extended thinking WITHOUT tools. NO beta headers needed. Model reasons before responding."
  },
  {
    name: "Interleaved Thinking",
    function: "chatWithInterleavedThinking()",
    apiCall: "anthropic.beta.messages.create()",
    betaHeaders: ["interleaved-thinking-2025-05-14"],
    maxOutput: 64_000,
    thinkingBudgetRule: "budget_tokens can exceed max_tokens (uses full 200K context)",
    description: "Thinking BETWEEN tool calls. REQUIRES beta headers. Best for complex agentic workflows."
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING MULTIPLIERS
// ═══════════════════════════════════════════════════════════════════════════════

export const PRICING_MULTIPLIERS = {
  cacheWrite5min: 1.25,    // 25% premium on base input
  cacheWrite1hr: 2.00,     // 100% premium on base input
  cacheRead: 0.10,         // 90% discount on base input
  batchDiscount: 0.50,     // 50% discount on all tokens
  longContextInput: 2.00,  // 2x input price for >200K
  longContextOutput: 1.50  // 1.5x output price for >200K
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT WINDOW LIMITS
// ═══════════════════════════════════════════════════════════════════════════════

export const CONTEXT_LIMITS = {
  standard: 200_000,
  extended: 1_000_000,
  maxOutput: 64_000,
  longContextThreshold: 200_000
};

// ═══════════════════════════════════════════════════════════════════════════════
// EFFORT LEVELS (Opus 4.5 only)
// ═══════════════════════════════════════════════════════════════════════════════

export const EFFORT_LEVELS = {
  low: {
    name: "Low",
    description: "Fast, minimal thinking. Good for simple tasks or high-volume automation.",
    tokenUsage: "Lowest"
  },
  medium: {
    name: "Medium", 
    description: "Balanced. Matches Sonnet 4.5's peak performance while using 76% fewer output tokens than High.",
    tokenUsage: "Moderate"
  },
  high: {
    name: "High",
    description: "Default. Exhaustive reasoning. Best for complex problems requiring deep analysis.",
    tokenUsage: "Highest"
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// BEST PRACTICES
// ═══════════════════════════════════════════════════════════════════════════════

export const BEST_PRACTICES = {
  thinkingBudget: [
    "Start with 16K tokens and increase incrementally",
    "For budgets above 32K, use batch processing",
    "Monitor actual usage vs. budget to optimize costs",
    "Thinking tokens count as OUTPUT tokens for billing"
  ],
  modelSelection: [
    "Opus 4.5: Complex reasoning, coding, agents, highest quality",
    "Sonnet 4.5: Best balance of speed/cost/quality for most use cases",
    "Haiku 4.5: High-volume, latency-sensitive, cost-optimized tasks"
  ],
  costOptimization: [
    "Use prompt caching (90% savings on cache reads)",
    "Use batch API (50% discount on all tokens)",
    "Start with lower effort levels and escalate as needed",
    "Use Haiku for sub-agents and parallelized tasks"
  ],
  contextManagement: [
    "Enable context-management beta header for long sessions",
    "Previous thinking blocks are auto-stripped (saves context)",
    "Opus 4.5 preserves thinking blocks by default (better continuity)",
    "Monitor context usage in long conversations"
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTATION URLS
// ═══════════════════════════════════════════════════════════════════════════════

export const DOC_URLS = {
  models: "https://docs.anthropic.com/en/docs/about-claude/models",
  pricing: "https://docs.anthropic.com/en/docs/about-claude/pricing",
  extendedThinking: "https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking",
  contextWindows: "https://docs.anthropic.com/en/docs/build-with-claude/context-windows",
  computerUse: "https://docs.anthropic.com/en/docs/build-with-claude/computer-use",
  promptCaching: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching",
  batchApi: "https://docs.anthropic.com/en/docs/build-with-claude/batch-api"
};

// ═══════════════════════════════════════════════════════════════════════════════
// CHARACTER LIMIT FOR RESPONSES
// ═══════════════════════════════════════════════════════════════════════════════

export const CHARACTER_LIMIT = 50_000;
