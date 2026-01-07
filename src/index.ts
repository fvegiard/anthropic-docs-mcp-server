/**
 * Anthropic Docs MCP Server
 * 
 * MCP server for consulting Claude 4.5 API documentation including:
 * - Model specifications (Opus 4.5, Sonnet 4.5, Haiku 4.5)
 * - Token limits and context windows
 * - Pricing information
 * - Extended thinking configuration
 * - Beta headers
 * - Best practices
 * 
 * @author L'Alliance Industrielle
 * @version 1.0.0
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

import {
  GetModelInfoSchema,
  GetPricingSchema,
  GetTokenLimitsSchema,
  GetThinkingConfigSchema,
  GetBetaHeadersSchema,
  SearchDocsSchema,
  CalculateCostSchema,
  GetBestPracticesSchema,
  GetFullDocsSchema,
  type GetModelInfoInput,
  type GetPricingInput,
  type GetTokenLimitsInput,
  type GetThinkingConfigInput,
  type GetBetaHeadersInput,
  type SearchDocsInput,
  type CalculateCostInput,
  type GetBestPracticesInput,
  type GetFullDocsInput
} from "./schemas/index.js";

import {
  getModelInfo,
  getPricing,
  getTokenLimits,
  getThinkingConfig,
  getBetaHeaders,
  searchDocs,
  calculateCost,
  getBestPractices,
  getFullDocs
} from "./services/docs-service.js";

// ═══════════════════════════════════════════════════════════════════════════════
// SERVER INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

const server = new McpServer({
  name: "anthropic-docs-mcp-server",
  version: "1.0.0"
});

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: GET MODEL INFO
// ═══════════════════════════════════════════════════════════════════════════════

server.registerTool(
  "anthropic_get_model_info",
  {
    title: "Get Claude Model Information",
    description: `Get detailed information about Claude 4.5 models including specifications, features, and capabilities.

Available models:
- opus_4_5: Flagship model, best for complex reasoning and coding
- sonnet_4_5: Balanced model, best value for most use cases  
- haiku_4_5: Fast model, best for high-volume tasks

Returns: Model name, API ID, context window, max output, features, and pricing.

Examples:
- Get Opus 4.5 specs: model="opus_4_5"
- Get all models: model="all"`,
    inputSchema: GetModelInfoSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: GetModelInfoInput) => {
    const result = getModelInfo(params.model, params.response_format);
    return {
      content: [{ type: "text", text: result }]
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: GET PRICING
// ═══════════════════════════════════════════════════════════════════════════════

server.registerTool(
  "anthropic_get_pricing",
  {
    title: "Get Claude Pricing",
    description: `Get pricing information for Claude 4.5 models.

Includes:
- Base input/output pricing per million tokens
- Cache pricing (5min and 1hr durations)
- Batch API discounts (50% off)
- Long context pricing (>200K tokens)

All prices in USD per million tokens (MTok).

Examples:
- Get Sonnet pricing: model="sonnet_4_5"
- Get all pricing with discounts: model="all", include_discounts=true`,
    inputSchema: GetPricingSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: GetPricingInput) => {
    const result = getPricing(params.model, params.include_discounts, params.response_format);
    return {
      content: [{ type: "text", text: result }]
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: GET TOKEN LIMITS
// ═══════════════════════════════════════════════════════════════════════════════

server.registerTool(
  "anthropic_get_token_limits",
  {
    title: "Get Token Limits",
    description: `Get context window and output token limits for Claude 4.5 models.

Key limits:
- Standard context: 200K tokens (all models)
- Extended context: 1M tokens (Sonnet only, beta)
- Max output: 64K tokens (all models)
- Min thinking budget: 1,024 tokens
- Recommended thinking: 16K-32K tokens

Examples:
- Get Opus limits: model="opus_4_5"
- Get all limits: model="all"`,
    inputSchema: GetTokenLimitsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: GetTokenLimitsInput) => {
    const result = getTokenLimits(params.model, params.response_format);
    return {
      content: [{ type: "text", text: result }]
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: GET THINKING CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

server.registerTool(
  "anthropic_get_thinking_config",
  {
    title: "Get Extended Thinking Configuration",
    description: `Get configuration details for Claude's extended thinking feature.

Includes:
- Budget token limits (min 1,024, recommended 16K-32K)
- Rules for budget_tokens vs max_tokens
- API modes (Standard, Thinking, Interleaved)
- Effort levels (low/medium/high for Opus 4.5)
- When to use batch processing (>32K budget)

Key rules:
- Standard: budget_tokens < max_tokens
- Interleaved with tools: budget can exceed max_tokens
- Thinking tokens billed as OUTPUT tokens

Examples:
- Full config: include_rules=true, include_api_modes=true`,
    inputSchema: GetThinkingConfigSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: GetThinkingConfigInput) => {
    const result = getThinkingConfig(params.include_rules, params.include_api_modes, params.response_format);
    return {
      content: [{ type: "text", text: result }]
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: GET BETA HEADERS
// ═══════════════════════════════════════════════════════════════════════════════

server.registerTool(
  "anthropic_get_beta_headers",
  {
    title: "Get Beta Headers",
    description: `Get information about available beta headers for Claude API.

Available headers:
- interleaved-thinking-2025-05-14: Enable thinking between tool calls
- context-management-2025-06-27: Auto-compaction for long sessions
- context-1m-2025-08-07: 1M context window (Sonnet only)

Includes usage examples and when each header is required.`,
    inputSchema: GetBetaHeadersSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: GetBetaHeadersInput) => {
    const result = getBetaHeaders(params.response_format);
    return {
      content: [{ type: "text", text: result }]
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: SEARCH DOCS
// ═══════════════════════════════════════════════════════════════════════════════

server.registerTool(
  "anthropic_search_docs",
  {
    title: "Search Documentation",
    description: `Search Claude 4.5 documentation for specific topics.

Searchable content:
- Model names and features
- Pricing and costs
- Token limits
- Extended thinking
- Beta headers
- Best practices

Examples:
- Find pricing: query="pricing"
- Find thinking config: query="budget tokens"
- Find Opus features: query="opus 4.5"`,
    inputSchema: SearchDocsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: SearchDocsInput) => {
    const result = searchDocs(params.query, params.response_format);
    return {
      content: [{ type: "text", text: result }]
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: CALCULATE COST
// ═══════════════════════════════════════════════════════════════════════════════

server.registerTool(
  "anthropic_calculate_cost",
  {
    title: "Calculate API Cost",
    description: `Calculate the cost for a Claude API request.

Factors:
- Input and output tokens
- Thinking tokens (counted as output)
- Prompt caching (90% savings on cache hits)
- Batch API (50% discount)
- Long context (>200K = premium pricing)

Note: Thinking tokens are ADDED to output tokens for billing.

Examples:
- Basic: model="sonnet_4_5", input_tokens=10000, output_tokens=2000
- With thinking: thinking_tokens=5000 (adds to output)
- With cache: use_cache=true, cache_hit_ratio=0.9`,
    inputSchema: CalculateCostSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: CalculateCostInput) => {
    const result = calculateCost(
      params.model,
      params.input_tokens,
      params.output_tokens,
      params.thinking_tokens,
      params.use_cache,
      params.cache_hit_ratio,
      params.use_batch,
      params.long_context,
      params.response_format
    );
    return {
      content: [{ type: "text", text: result }]
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: GET BEST PRACTICES
// ═══════════════════════════════════════════════════════════════════════════════

server.registerTool(
  "anthropic_get_best_practices",
  {
    title: "Get Best Practices",
    description: `Get best practices for using Claude 4.5 models.

Topics:
- thinking: Thinking budget optimization
- model_selection: Choosing the right model
- cost_optimization: Reducing API costs
- context_management: Managing long conversations
- all: All best practices

Examples:
- Cost tips: topic="cost_optimization"
- Model selection: topic="model_selection"
- Everything: topic="all"`,
    inputSchema: GetBestPracticesSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: GetBestPracticesInput) => {
    const result = getBestPractices(params.topic, params.response_format);
    return {
      content: [{ type: "text", text: result }]
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: GET FULL DOCS
// ═══════════════════════════════════════════════════════════════════════════════

server.registerTool(
  "anthropic_get_full_docs",
  {
    title: "Get Full Documentation",
    description: `Get the complete Claude 4.5 documentation in one response.

Includes:
- All model specifications
- Complete pricing tables
- Token limits
- Extended thinking config
- Beta headers
- Best practices
- Documentation URLs

Use this for a comprehensive reference or to cache all docs locally.`,
    inputSchema: GetFullDocsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: GetFullDocsInput) => {
    const result = getFullDocs(params.response_format);
    return {
      content: [{ type: "text", text: result }]
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSPORT: STDIO (Default)
// ═══════════════════════════════════════════════════════════════════════════════

async function runStdio(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Anthropic Docs MCP Server running on stdio");
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSPORT: HTTP
// ═══════════════════════════════════════════════════════════════════════════════

async function runHTTP(): Promise<void> {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "anthropic-docs-mcp-server", version: "1.0.0" });
  });

  // MCP endpoint
  app.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT || "3000");
  app.listen(port, () => {
    console.error(`Anthropic Docs MCP Server running on http://localhost:${port}/mcp`);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

const transport = process.env.TRANSPORT || "stdio";

if (transport === "http") {
  runHTTP().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
