/**
 * Documentation Service
 * Provides formatted documentation for Claude 4.5 models
 */

import {
  CLAUDE_MODELS,
  THINKING_CONFIG,
  BETA_HEADERS,
  API_MODES,
  PRICING_MULTIPLIERS,
  CONTEXT_LIMITS,
  EFFORT_LEVELS,
  BEST_PRACTICES,
  DOC_URLS
} from "../constants.js";
import type { ClaudeModel } from "../types.js";

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL INFO
// ═══════════════════════════════════════════════════════════════════════════════

export function getModelInfo(modelKey: string, format: "markdown" | "json"): string {
  if (modelKey === "all") {
    const models = Object.entries(CLAUDE_MODELS);
    
    if (format === "json") {
      return JSON.stringify(CLAUDE_MODELS, null, 2);
    }
    
    return models.map(([_, model]) => formatModelMarkdown(model)).join("\n\n---\n\n");
  }
  
  const model = CLAUDE_MODELS[modelKey];
  if (!model) {
    return `Error: Model '${modelKey}' not found. Available: opus_4_5, sonnet_4_5, haiku_4_5`;
  }
  
  if (format === "json") {
    return JSON.stringify(model, null, 2);
  }
  
  return formatModelMarkdown(model);
}

function formatModelMarkdown(model: ClaudeModel): string {
  return `## ${model.name}

**API ID:** \`${model.apiId}\`
**Alias:** \`${model.alias}\`
**Tier:** ${model.tier}
**Release Date:** ${model.releaseDate}
**Knowledge Cutoff:** ${model.knowledgeCutoff}

### Token Limits
- **Context Window:** ${model.contextWindow.toLocaleString()} tokens
${model.contextWindowExtended ? `- **Extended Context (beta):** ${model.contextWindowExtended.toLocaleString()} tokens` : ""}
- **Max Output:** ${model.maxOutput.toLocaleString()} tokens

### Pricing (per million tokens)
- **Input:** $${model.pricing.input.toFixed(2)}
- **Output:** $${model.pricing.output.toFixed(2)}
${model.pricing.longContextInput ? `- **Long Context Input (>200K):** $${model.pricing.longContextInput.toFixed(2)}` : ""}
${model.pricing.longContextOutput ? `- **Long Context Output (>200K):** $${model.pricing.longContextOutput.toFixed(2)}` : ""}
- **Batch Discount:** ${model.pricing.batchDiscount}

### Features
${model.features.map(f => `- ${f}`).join("\n")}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════════════════════════

export function getPricing(modelKey: string, includeDiscounts: boolean, format: "markdown" | "json"): string {
  const models = modelKey === "all" 
    ? Object.entries(CLAUDE_MODELS) 
    : [[modelKey, CLAUDE_MODELS[modelKey]] as const].filter(([_, m]) => m);
  
  if (models.length === 0) {
    return `Error: Model '${modelKey}' not found.`;
  }
  
  if (format === "json") {
    const pricing = Object.fromEntries(
      models.map(([key, model]) => [key, {
        model: model.name,
        pricing: model.pricing,
        ...(includeDiscounts ? { multipliers: PRICING_MULTIPLIERS } : {})
      }])
    );
    return JSON.stringify(pricing, null, 2);
  }
  
  let md = "# Claude 4.5 Pricing\n\n";
  md += "| Model | Input ($/MTok) | Output ($/MTok) | Batch Discount |\n";
  md += "|-------|----------------|-----------------|----------------|\n";
  
  for (const [_, model] of models) {
    md += `| ${model.name} | $${model.pricing.input.toFixed(2)} | $${model.pricing.output.toFixed(2)} | ${model.pricing.batchDiscount} |\n`;
  }
  
  if (includeDiscounts) {
    md += `\n## Discount Multipliers\n\n`;
    md += `- **Cache Write (5min):** ${PRICING_MULTIPLIERS.cacheWrite5min}x base input\n`;
    md += `- **Cache Write (1hr):** ${PRICING_MULTIPLIERS.cacheWrite1hr}x base input\n`;
    md += `- **Cache Read:** ${PRICING_MULTIPLIERS.cacheRead}x base input (90% savings)\n`;
    md += `- **Batch API:** ${PRICING_MULTIPLIERS.batchDiscount}x all tokens (50% savings)\n`;
    md += `- **Long Context Input (>200K):** ${PRICING_MULTIPLIERS.longContextInput}x input\n`;
    md += `- **Long Context Output (>200K):** ${PRICING_MULTIPLIERS.longContextOutput}x output\n`;
  }
  
  return md;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOKEN LIMITS
// ═══════════════════════════════════════════════════════════════════════════════

export function getTokenLimits(modelKey: string, format: "markdown" | "json"): string {
  const models = modelKey === "all" 
    ? Object.entries(CLAUDE_MODELS) 
    : [[modelKey, CLAUDE_MODELS[modelKey]] as const].filter(([_, m]) => m);
  
  if (format === "json") {
    return JSON.stringify({
      models: Object.fromEntries(
        models.map(([key, model]) => [key, {
          contextWindow: model.contextWindow,
          contextWindowExtended: model.contextWindowExtended,
          maxOutput: model.maxOutput
        }])
      ),
      limits: CONTEXT_LIMITS,
      thinking: {
        minBudget: THINKING_CONFIG.minBudget,
        recommendedStart: THINKING_CONFIG.recommendedStart,
        largeBudgetThreshold: THINKING_CONFIG.largeBudgetThreshold
      }
    }, null, 2);
  }
  
  let md = "# Token Limits\n\n";
  md += "| Model | Context Window | Extended Context | Max Output |\n";
  md += "|-------|----------------|------------------|------------|\n";
  
  for (const [_, model] of models) {
    const extended = model.contextWindowExtended 
      ? `${(model.contextWindowExtended / 1000).toLocaleString()}K (beta)` 
      : "N/A";
    md += `| ${model.name} | ${(model.contextWindow / 1000).toLocaleString()}K | ${extended} | ${(model.maxOutput / 1000).toLocaleString()}K |\n`;
  }
  
  md += `\n## Thinking Budget Limits\n\n`;
  md += `- **Minimum:** ${THINKING_CONFIG.minBudget.toLocaleString()} tokens\n`;
  md += `- **Recommended Start:** ${THINKING_CONFIG.recommendedStart.toLocaleString()} tokens\n`;
  md += `- **Large Budget Threshold:** ${THINKING_CONFIG.largeBudgetThreshold.toLocaleString()} tokens (use batch processing above this)\n`;
  md += `- **Max with Interleaved:** ${THINKING_CONFIG.maxWithInterleaved.toLocaleString()} tokens (full context window)\n`;
  
  return md;
}

// ═══════════════════════════════════════════════════════════════════════════════
// THINKING CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

export function getThinkingConfig(includeRules: boolean, includeApiModes: boolean, format: "markdown" | "json"): string {
  if (format === "json") {
    return JSON.stringify({
      config: THINKING_CONFIG,
      ...(includeApiModes ? { apiModes: API_MODES } : {}),
      effortLevels: EFFORT_LEVELS
    }, null, 2);
  }
  
  let md = "# Extended Thinking Configuration\n\n";
  
  md += "## Budget Limits\n\n";
  md += `- **Minimum budget_tokens:** ${THINKING_CONFIG.minBudget.toLocaleString()}\n`;
  md += `- **Recommended start:** ${THINKING_CONFIG.recommendedStart.toLocaleString()}\n`;
  md += `- **Large budget threshold:** ${THINKING_CONFIG.largeBudgetThreshold.toLocaleString()} (use batch processing)\n`;
  md += `- **Max with interleaved thinking:** ${THINKING_CONFIG.maxWithInterleaved.toLocaleString()} (full context window)\n`;
  
  if (includeRules) {
    md += "\n## Rules\n\n";
    THINKING_CONFIG.rules.forEach(rule => {
      md += `- ${rule}\n`;
    });
  }
  
  if (includeApiModes) {
    md += "\n## API Modes\n\n";
    md += "| Mode | API Call | Beta Headers | Budget Rule |\n";
    md += "|------|----------|--------------|-------------|\n";
    
    for (const mode of API_MODES) {
      const headers = mode.betaHeaders.length > 0 ? mode.betaHeaders.join(", ") : "None";
      md += `| ${mode.name} | \`${mode.apiCall}\` | ${headers} | ${mode.thinkingBudgetRule} |\n`;
    }
  }
  
  md += "\n## Effort Levels (Opus 4.5 only)\n\n";
  for (const [key, level] of Object.entries(EFFORT_LEVELS)) {
    md += `### ${level.name}\n`;
    md += `- **Token Usage:** ${level.tokenUsage}\n`;
    md += `- **Description:** ${level.description}\n\n`;
  }
  
  return md;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BETA HEADERS
// ═══════════════════════════════════════════════════════════════════════════════

export function getBetaHeaders(format: "markdown" | "json"): string {
  if (format === "json") {
    return JSON.stringify(BETA_HEADERS, null, 2);
  }
  
  let md = "# Beta Headers\n\n";
  md += "| Name | Value | Purpose | Required For |\n";
  md += "|------|-------|---------|---------------|\n";
  
  for (const header of BETA_HEADERS) {
    const models = header.models ? ` (${header.models.join(", ")})` : "";
    md += `| ${header.name} | \`${header.value}\` | ${header.purpose} | ${header.requiredFor}${models} |\n`;
  }
  
  md += "\n## Usage Examples\n\n";
  md += "```typescript\n";
  md += "// Interleaved thinking with tools\n";
  md += "const response = await anthropic.beta.messages.create({\n";
  md += "  model: 'claude-sonnet-4-5-20250929',\n";
  md += "  betas: ['interleaved-thinking-2025-05-14'],\n";
  md += "  thinking: { type: 'enabled', budget_tokens: 32000 },\n";
  md += "  tools: [...],\n";
  md += "  // ...\n";
  md += "});\n\n";
  md += "// 1M context (Sonnet only)\n";
  md += "const response = await anthropic.beta.messages.create({\n";
  md += "  model: 'claude-sonnet-4-5-20250929',\n";
  md += "  betas: ['context-1m-2025-08-07'],\n";
  md += "  // ...\n";
  md += "});\n";
  md += "```\n";
  
  return md;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COST CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════════

export interface CostCalculation {
  model: string;
  inputTokens: number;
  outputTokens: number;
  thinkingTokens: number;
  totalOutputTokens: number;
  baseCost: number;
  cacheDiscount: number;
  batchDiscount: number;
  longContextPremium: number;
  finalCost: number;
  breakdown: {
    inputCost: number;
    outputCost: number;
  };
}

export function calculateCost(
  modelKey: string,
  inputTokens: number,
  outputTokens: number,
  thinkingTokens: number,
  useCache: boolean,
  cacheHitRatio: number,
  useBatch: boolean,
  longContext: boolean,
  format: "markdown" | "json"
): string {
  const model = CLAUDE_MODELS[modelKey];
  if (!model) {
    return `Error: Model '${modelKey}' not found.`;
  }
  
  // Thinking tokens are billed as output tokens
  const totalOutputTokens = outputTokens + thinkingTokens;
  
  // Base costs
  let inputPrice = model.pricing.input;
  let outputPrice = model.pricing.output;
  
  // Long context premium
  if (longContext && model.pricing.longContextInput) {
    inputPrice = model.pricing.longContextInput;
  }
  if (longContext && model.pricing.longContextOutput) {
    outputPrice = model.pricing.longContextOutput;
  }
  
  // Calculate base cost
  let inputCost = (inputTokens / 1_000_000) * inputPrice;
  let outputCost = (totalOutputTokens / 1_000_000) * outputPrice;
  
  // Cache discount on input
  let cacheDiscount = 0;
  if (useCache) {
    const cacheHits = inputTokens * cacheHitRatio;
    const cacheMisses = inputTokens * (1 - cacheHitRatio);
    
    // Cache hits cost 10% of base
    const cacheHitCost = (cacheHits / 1_000_000) * inputPrice * PRICING_MULTIPLIERS.cacheRead;
    // Cache misses cost 125% (write cost)
    const cacheMissCost = (cacheMisses / 1_000_000) * inputPrice * PRICING_MULTIPLIERS.cacheWrite5min;
    
    const originalInputCost = inputCost;
    inputCost = cacheHitCost + cacheMissCost;
    cacheDiscount = originalInputCost - inputCost;
  }
  
  let baseCost = inputCost + outputCost;
  
  // Batch discount
  let batchDiscount = 0;
  if (useBatch) {
    batchDiscount = baseCost * 0.5;
    baseCost = baseCost * 0.5;
  }
  
  const result: CostCalculation = {
    model: model.name,
    inputTokens,
    outputTokens,
    thinkingTokens,
    totalOutputTokens,
    baseCost: inputCost + outputCost + (batchDiscount > 0 ? batchDiscount : 0),
    cacheDiscount,
    batchDiscount,
    longContextPremium: longContext ? (inputPrice - model.pricing.input) * (inputTokens / 1_000_000) : 0,
    finalCost: baseCost,
    breakdown: {
      inputCost,
      outputCost
    }
  };
  
  if (format === "json") {
    return JSON.stringify(result, null, 2);
  }
  
  let md = `# Cost Calculation: ${model.name}\n\n`;
  md += `## Tokens\n`;
  md += `- **Input:** ${inputTokens.toLocaleString()}\n`;
  md += `- **Output:** ${outputTokens.toLocaleString()}\n`;
  md += `- **Thinking:** ${thinkingTokens.toLocaleString()}\n`;
  md += `- **Total Output (output + thinking):** ${totalOutputTokens.toLocaleString()}\n\n`;
  
  md += `## Cost Breakdown\n`;
  md += `- **Input Cost:** $${result.breakdown.inputCost.toFixed(6)}\n`;
  md += `- **Output Cost:** $${result.breakdown.outputCost.toFixed(6)}\n`;
  
  if (cacheDiscount > 0) {
    md += `- **Cache Savings:** -$${cacheDiscount.toFixed(6)}\n`;
  }
  if (batchDiscount > 0) {
    md += `- **Batch Savings:** -$${batchDiscount.toFixed(6)}\n`;
  }
  if (result.longContextPremium > 0) {
    md += `- **Long Context Premium:** +$${result.longContextPremium.toFixed(6)}\n`;
  }
  
  md += `\n## Final Cost: **$${result.finalCost.toFixed(6)}**\n`;
  
  return md;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BEST PRACTICES
// ═══════════════════════════════════════════════════════════════════════════════

export function getBestPractices(topic: string, format: "markdown" | "json"): string {
  const topicMap: Record<string, keyof typeof BEST_PRACTICES> = {
    thinking: "thinkingBudget",
    model_selection: "modelSelection",
    cost_optimization: "costOptimization",
    context_management: "contextManagement"
  };
  
  if (format === "json") {
    if (topic === "all") {
      return JSON.stringify(BEST_PRACTICES, null, 2);
    }
    const key = topicMap[topic];
    return JSON.stringify({ [topic]: BEST_PRACTICES[key] }, null, 2);
  }
  
  let md = "# Best Practices\n\n";
  
  const topics = topic === "all" 
    ? Object.entries(topicMap) 
    : [[topic, topicMap[topic]] as const];
  
  for (const [name, key] of topics) {
    const practices = BEST_PRACTICES[key];
    md += `## ${name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}\n\n`;
    practices.forEach(p => {
      md += `- ${p}\n`;
    });
    md += "\n";
  }
  
  return md;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH DOCS
// ═══════════════════════════════════════════════════════════════════════════════

export function searchDocs(query: string, format: "markdown" | "json"): string {
  const lowerQuery = query.toLowerCase();
  const results: Array<{ section: string; content: string; relevance: number }> = [];
  
  // Search models
  for (const [key, model] of Object.entries(CLAUDE_MODELS)) {
    if (
      model.name.toLowerCase().includes(lowerQuery) ||
      model.apiId.toLowerCase().includes(lowerQuery) ||
      model.features.some(f => f.toLowerCase().includes(lowerQuery))
    ) {
      results.push({
        section: "Models",
        content: formatModelMarkdown(model),
        relevance: model.name.toLowerCase().includes(lowerQuery) ? 1 : 0.7
      });
    }
  }
  
  // Search thinking config
  if (
    lowerQuery.includes("think") ||
    lowerQuery.includes("budget") ||
    lowerQuery.includes("reasoning")
  ) {
    results.push({
      section: "Extended Thinking",
      content: getThinkingConfig(true, true, "markdown"),
      relevance: 0.9
    });
  }
  
  // Search pricing
  if (
    lowerQuery.includes("price") ||
    lowerQuery.includes("cost") ||
    lowerQuery.includes("token") ||
    lowerQuery.includes("$")
  ) {
    results.push({
      section: "Pricing",
      content: getPricing("all", true, "markdown"),
      relevance: 0.9
    });
  }
  
  // Search beta headers
  if (
    lowerQuery.includes("beta") ||
    lowerQuery.includes("header") ||
    lowerQuery.includes("interleaved") ||
    lowerQuery.includes("1m") ||
    lowerQuery.includes("context")
  ) {
    results.push({
      section: "Beta Headers",
      content: getBetaHeaders("markdown"),
      relevance: 0.8
    });
  }
  
  // Sort by relevance
  results.sort((a, b) => b.relevance - a.relevance);
  
  if (results.length === 0) {
    return format === "json"
      ? JSON.stringify({ query, results: [], message: "No results found" })
      : `No results found for: "${query}"\n\nTry searching for: models, pricing, tokens, thinking, beta headers`;
  }
  
  if (format === "json") {
    return JSON.stringify({ query, results }, null, 2);
  }
  
  let md = `# Search Results for: "${query}"\n\n`;
  md += `Found ${results.length} result(s)\n\n`;
  
  for (const result of results.slice(0, 3)) {
    md += `---\n\n## ${result.section}\n\n`;
    md += result.content + "\n\n";
  }
  
  return md;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FULL DOCS
// ═══════════════════════════════════════════════════════════════════════════════

export function getFullDocs(format: "markdown" | "json"): string {
  if (format === "json") {
    return JSON.stringify({
      models: CLAUDE_MODELS,
      thinking: THINKING_CONFIG,
      betaHeaders: BETA_HEADERS,
      apiModes: API_MODES,
      pricingMultipliers: PRICING_MULTIPLIERS,
      contextLimits: CONTEXT_LIMITS,
      effortLevels: EFFORT_LEVELS,
      bestPractices: BEST_PRACTICES,
      docUrls: DOC_URLS
    }, null, 2);
  }
  
  let md = "# Claude 4.5 Complete Documentation\n\n";
  md += "*Last Updated: January 2026*\n\n";
  md += "---\n\n";
  md += getModelInfo("all", "markdown") + "\n\n";
  md += "---\n\n";
  md += getPricing("all", true, "markdown") + "\n\n";
  md += "---\n\n";
  md += getTokenLimits("all", "markdown") + "\n\n";
  md += "---\n\n";
  md += getThinkingConfig(true, true, "markdown") + "\n\n";
  md += "---\n\n";
  md += getBetaHeaders("markdown") + "\n\n";
  md += "---\n\n";
  md += getBestPractices("all", "markdown") + "\n\n";
  md += "---\n\n";
  md += "# Documentation URLs\n\n";
  for (const [key, url] of Object.entries(DOC_URLS)) {
    md += `- **${key}:** ${url}\n`;
  }
  
  return md;
}
