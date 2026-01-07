# Anthropic Docs MCP Server

MCP server for consulting Claude 4.5 API documentation. Always have instant access to model specs, pricing, token limits, and best practices.

## 🚀 Features

- **Model Information**: Complete specs for Opus 4.5, Sonnet 4.5, Haiku 4.5
- **Pricing Calculator**: Calculate API costs with cache and batch discounts
- **Token Limits**: Context windows, max output, thinking budgets
- **Extended Thinking**: Configuration, rules, and API modes
- **Beta Headers**: All available beta features documented
- **Search**: Find specific documentation topics
- **Best Practices**: Optimization tips for cost, performance, and quality

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/anthropic-docs-mcp-server.git
cd anthropic-docs-mcp-server

# Install dependencies
npm install

# Build
npm run build
```

## 🔧 Configuration

### Claude Desktop (claude_desktop_config.json)

```json
{
  "mcpServers": {
    "anthropic-docs": {
      "command": "node",
      "args": ["/path/to/anthropic-docs-mcp-server/dist/index.js"]
    }
  }
}
```

### HTTP Transport (for remote access)

```bash
TRANSPORT=http PORT=3000 npm start
```

## 🛠️ Available Tools

### `anthropic_get_model_info`
Get detailed information about Claude 4.5 models.

```json
{
  "model": "opus_4_5",  // opus_4_5 | sonnet_4_5 | haiku_4_5 | all
  "response_format": "markdown"  // markdown | json
}
```

### `anthropic_get_pricing`
Get pricing information with discounts.

```json
{
  "model": "all",
  "include_discounts": true,
  "response_format": "markdown"
}
```

### `anthropic_get_token_limits`
Get context window and output limits.

```json
{
  "model": "all",
  "response_format": "markdown"
}
```

### `anthropic_get_thinking_config`
Get extended thinking configuration.

```json
{
  "include_rules": true,
  "include_api_modes": true,
  "response_format": "markdown"
}
```

### `anthropic_get_beta_headers`
Get all available beta headers.

```json
{
  "response_format": "markdown"
}
```

### `anthropic_search_docs`
Search documentation for specific topics.

```json
{
  "query": "budget tokens",
  "response_format": "markdown"
}
```

### `anthropic_calculate_cost`
Calculate API costs.

```json
{
  "model": "sonnet_4_5",
  "input_tokens": 10000,
  "output_tokens": 2000,
  "thinking_tokens": 5000,
  "use_cache": true,
  "cache_hit_ratio": 0.9,
  "use_batch": false,
  "long_context": false,
  "response_format": "markdown"
}
```

### `anthropic_get_best_practices`
Get best practices for specific topics.

```json
{
  "topic": "cost_optimization",  // thinking | model_selection | cost_optimization | context_management | all
  "response_format": "markdown"
}
```

### `anthropic_get_full_docs`
Get complete documentation.

```json
{
  "response_format": "json"
}
```

## 📊 Quick Reference

### Claude 4.5 Models

| Model | Context | Max Output | Input $/MTok | Output $/MTok |
|-------|---------|------------|--------------|---------------|
| Opus 4.5 | 200K | 64K | $5.00 | $25.00 |
| Sonnet 4.5 | 200K (1M beta) | 64K | $3.00 | $15.00 |
| Haiku 4.5 | 200K | 64K | $1.00 | $5.00 |

### Extended Thinking

| Parameter | Value |
|-----------|-------|
| Min budget | 1,024 tokens |
| Recommended | 16,000 tokens |
| Large threshold | 32,000 tokens |
| Max (interleaved) | 200,000 tokens |

### Beta Headers

| Header | Purpose |
|--------|---------|
| `interleaved-thinking-2025-05-14` | Thinking between tool calls |
| `context-management-2025-06-27` | Auto-compaction |
| `context-1m-2025-08-07` | 1M context (Sonnet only) |

## 🔗 Official Documentation

- [Models Overview](https://docs.anthropic.com/en/docs/about-claude/models)
- [Pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)
- [Extended Thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking)
- [Context Windows](https://docs.anthropic.com/en/docs/build-with-claude/context-windows)

## 📝 License

MIT

## 👤 Author

L'Alliance Industrielle (DR Électrique, SIP Électrique, BR Construction)
