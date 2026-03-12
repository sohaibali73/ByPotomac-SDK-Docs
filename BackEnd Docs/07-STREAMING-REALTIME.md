# ByPotomac SDK — Streaming, Real-Time, and WebSocket Architecture

## Streaming Architecture Overview

ByPotomac SDK delivers AI-generated responses through a real-time streaming architecture built on Server-Sent Events (SSE). The streaming protocol is based on the Vercel AI SDK Data Stream Protocol, which provides a structured, typed message format that all platform clients can parse natively. This protocol is the single communication standard used by every client application in the ByPotomac ecosystem.

Every platform client — Web (Next.js), Windows (WinUI 3, 100% native, no cross-platform framework), iOS/macOS (Swift/SwiftUI, 100% native, no cross-platform framework), and all planned native platforms — implements the same stream parsing logic adapted to its native networking stack.

## Vercel AI SDK Data Stream Protocol

The Data Stream Protocol is a line-based text format transmitted over an SSE (Server-Sent Events) connection. Each line consists of a single-character type prefix, a colon separator, and a JSON-encoded payload.

### Stream Type Codes

| Code | Name | Payload Format | Description |
|---|---|---|---|
| `0` | Text | `"string"` | A chunk of generated text (JSON-encoded string) |
| `2` | Data | `[{...}]` | Structured data payload (JSON array) |
| `3` | Error | `"string"` | Error message |
| `9` | Tool Call Begin | `{"toolCallId":"...","toolName":"..."}` | Start of a tool invocation |
| `a` | Tool Call Delta | `{"toolCallId":"...","argsTextDelta":"..."}` | Incremental tool call argument text |
| `b` | Tool Call End | `{"toolCallId":"..."}` | Tool call argument streaming complete |
| `c` | Tool Result | `{"toolCallId":"...","result":{...}}` | Tool execution result |
| `d` | Finish Step | `{"finishReason":"...","usage":{...},"isContinued":...}` | Step completion signal |
| `e` | Finish | `{"finishReason":"...","usage":{...}}` | Stream completion signal |
| `f` | Message Annotation | `{...}` | Metadata annotation for the message |
| `g` | Source | `{"sourceType":"...","id":"...","url":"..."}` | Source attribution reference |

### Complete Stream Example

The following example shows a complete AI response stream for a query that involves tool invocation:

```
0:"I'll look up "
0:"the current price "
0:"for Apple Inc. "
9:{"toolCallId":"call_001","toolName":"get_stock_quote"}
a:{"toolCallId":"call_001","argsTextDelta":"{\"sy"}
a:{"toolCallId":"call_001","argsTextDelta":"mbol\":\""}
a:{"toolCallId":"call_001","argsTextDelta":"AAPL\"}"}
b:{"toolCallId":"call_001"}
c:{"toolCallId":"call_001","result":{"symbol":"AAPL","price":245.50,"change":5.23,"changePercent":2.18,"volume":52340000}}
0:"\n\nApple Inc. (AAPL) is currently trading at "
0:"**$245.50**, up "
0:"$5.23 (+2.18%) "
0:"on volume of 52.3M shares."
2:[{"session_id":"abc-123","title":"AAPL Price Check","messageId":"msg-456"}]
d:{"finishReason":"stop","usage":{"promptTokens":850,"completionTokens":127},"isContinued":false}
e:{"finishReason":"stop","usage":{"promptTokens":850,"completionTokens":127}}
```

## SSE Connection Lifecycle

### Connection Establishment

```
Client                                  SDK
  │                                       │
  │  POST /api/chat                       │
  │  Content-Type: application/json       │
  │  Accept: text/event-stream            │
  │  Authorization: Bearer <token>        │
  │──────────────────────────────────────>│
  │                                       │
  │  HTTP/1.1 200 OK                      │
  │  Content-Type: text/event-stream      │
  │  Cache-Control: no-cache              │
  │  Connection: keep-alive               │
  │  X-Vercel-AI-Data-Stream: v1          │
  │<──────────────────────────────────────│
  │                                       │
  │  0:"First token "                     │
  │<──────────────────────────────────────│
  │                                       │
  │  0:"second token "                    │
  │<──────────────────────────────────────│
  │                                       │
  │  ... (streaming continues)            │
  │                                       │
  │  e:{"finishReason":"stop",...}        │
  │<──────────────────────────────────────│
  │                                       │
  │  (connection closed by server)        │
```

### Response Headers

| Header | Value | Purpose |
|---|---|---|
| `Content-Type` | `text/event-stream; charset=utf-8` | SSE content type |
| `Cache-Control` | `no-cache, no-transform` | Prevent caching |
| `Connection` | `keep-alive` | Persistent connection |
| `X-Vercel-AI-Data-Stream` | `v1` | Protocol version identifier |
| `X-Accel-Buffering` | `no` | Disable Nginx buffering |
| `Transfer-Encoding` | `chunked` | Chunked transfer |

## Stream Encoding (Server-Side)

The SDK encodes stream events through the `StreamingEncoder` class in `backend_platform/streaming/encoder.py` and the SSE utilities in `backend_platform/streaming/sse.py`.

### Text Encoding

Text tokens from the Claude API are encoded as type `0` messages with JSON string encoding:

```python
def encode_text(text: str) -> str:
    return f'0:{json.dumps(text)}\n'
```

### Tool Call Encoding

Tool invocations are encoded as a sequence of begin, delta, and end messages:

```python
def encode_tool_call_begin(tool_call_id: str, tool_name: str) -> str:
    return f'9:{json.dumps({"toolCallId": tool_call_id, "toolName": tool_name})}\n'

def encode_tool_call_delta(tool_call_id: str, args_delta: str) -> str:
    return f'a:{json.dumps({"toolCallId": tool_call_id, "argsTextDelta": args_delta})}\n'

def encode_tool_call_end(tool_call_id: str) -> str:
    return f'b:{json.dumps({"toolCallId": tool_call_id})}\n'

def encode_tool_result(tool_call_id: str, result: Any) -> str:
    return f'c:{json.dumps({"toolCallId": tool_call_id, "result": result})}\n'
```

### Data and Finish Encoding

```python
def encode_data(data: list) -> str:
    return f'2:{json.dumps(data)}\n'

def encode_finish_step(finish_reason: str, usage: dict, is_continued: bool = False) -> str:
    return f'd:{json.dumps({"finishReason": finish_reason, "usage": usage, "isContinued": is_continued})}\n'

def encode_finish(finish_reason: str, usage: dict) -> str:
    return f'e:{json.dumps({"finishReason": finish_reason, "usage": usage})}\n'

def encode_error(message: str) -> str:
    return f'3:{json.dumps(message)}\n'
```

## Tool Orchestration During Streaming

When the Claude model invokes a tool during a streaming response, the SDK executes the following orchestration:

```
Claude API                    SDK                          Client
  │                             │                             │
  │  stream: tool_use start     │                             │
  │  (tool name + call id)      │                             │
  │────────────────────────────>│                             │
  │                             │  9: tool call begin          │
  │                             │────────────────────────────>│
  │                             │                             │
  │  stream: tool_use delta     │                             │
  │  (argument chunks)          │                             │
  │────────────────────────────>│                             │
  │                             │  a: tool call delta          │
  │                             │────────────────────────────>│
  │                             │                             │
  │  stream: tool_use end       │                             │
  │────────────────────────────>│                             │
  │                             │  b: tool call end            │
  │                             │────────────────────────────>│
  │                             │                             │
  │                             │  Execute tool server-side    │
  │                             │  (market data, backtest,     │
  │                             │   EDGAR search, etc.)        │
  │                             │                             │
  │                             │  c: tool result              │
  │                             │────────────────────────────>│
  │                             │                             │
  │  Continue with tool result  │                             │
  │  in context                 │                             │
  │<────────────────────────────│                             │
  │                             │                             │
  │  stream: text tokens        │                             │
  │────────────────────────────>│                             │
  │                             │  0: text tokens              │
  │                             │────────────────────────────>│
```

## Available AI Tools

The following tools are available for Claude to invoke during conversations:

| Tool Name | Description | Module |
|---|---|---|
| `get_stock_quote` | Real-time stock price and quote data | `apps/analyst/tools/` |
| `get_historical_data` | Historical OHLCV price data | `apps/analyst/tools/` |
| `search_stocks` | Search for stocks by name or ticker | `apps/analyst/tools/` |
| `get_company_info` | Company profile and fundamental data | `apps/analyst/tools/` |
| `search_sec_filings` | Search SEC EDGAR for company filings | `apps/analyst/tools/` |
| `get_filing_content` | Retrieve and parse SEC filing content | `apps/analyst/tools/` |
| `run_backtest` | Execute portfolio backtest | `apps/analyst/tools/` |
| `validate_afl` | Validate AFL expression syntax | `apps/analyst/tools/` |
| `execute_afl` | Execute AFL expression against data | `apps/analyst/tools/` |
| `calculate_risk_metrics` | Portfolio risk analysis (VaR, beta, Sharpe) | `apps/analyst/tools/` |
| `calculate_correlation` | Asset correlation matrix | `apps/analyst/tools/` |
| `search_knowledge_base` | Semantic search in user's knowledge base | `apps/analyst/tools/` |
| `create_chart` | Generate chart specifications | `apps/analyst/tools/` |
| `create_table` | Generate structured data tables | `apps/analyst/tools/` |
| `calculate_returns` | Period return calculations | `apps/analyst/tools/` |
| `screen_stocks` | Stock screening with filters | `apps/analyst/tools/` |
| `get_economic_data` | Economic indicators and macro data | `apps/analyst/tools/` |
| `compare_stocks` | Side-by-side stock comparison | `apps/analyst/tools/` |
| `get_options_data` | Options chain and pricing data | `apps/analyst/tools/` |
| `get_insider_trades` | Insider trading activity | `apps/analyst/tools/` |

## Generative UI Cards

When tools return structured data, the SDK can encode the results as generative UI cards that clients render natively. The card system supports 22 card types:

| Card Type | Description |
|---|---|
| `stock_quote` | Real-time stock price display |
| `price_chart` | Interactive line/candlestick chart |
| `data_table` | Sortable data table |
| `comparison` | Side-by-side metric comparison |
| `risk_summary` | Risk metrics dashboard |
| `filing_summary` | SEC filing summary card |
| `backtest_result` | Backtest performance summary |
| `correlation_matrix` | Heatmap correlation display |
| `portfolio_summary` | Portfolio allocation and performance |
| `economic_indicator` | Economic data visualization |
| `news_feed` | Recent news headlines |
| `insider_trade` | Insider trading activity list |
| `options_chain` | Options pricing table |
| `earnings_summary` | Earnings report highlights |
| `sector_heatmap` | Sector performance heatmap |
| `dividend_history` | Dividend payment history |
| `analyst_rating` | Consensus analyst ratings |
| `financial_statement` | Income/Balance/Cash flow tables |
| `alert` | Warning or information alert |
| `code_block` | Code or formula display |
| `markdown` | Rich formatted text |
| `loading` | Loading/progress indicator |

## Supabase Realtime

In addition to SSE streaming for AI responses, the SDK leverages Supabase Realtime for database change notifications. Clients can subscribe to real-time updates on:

- **Session updates**: Receive notifications when a session is modified
- **Message inserts**: Receive new messages as they are persisted
- **Task status changes**: Track background task progress in real time
- **File upload completion**: Notification when file processing completes

### Realtime Subscription

```javascript
// Web client example
const channel = supabase
  .channel('session-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `session_id=eq.${sessionId}`
  }, (payload) => {
    handleNewMessage(payload.new);
  })
  .subscribe();
```

## Error Handling in Streams

When an error occurs during streaming, the SDK sends a type `3` error message and closes the connection:

```
0:"Processing your request"
0:"..."
3:"Rate limit exceeded for Anthropic API. Please try again in 60 seconds."
```

Clients should handle the following error scenarios:

| Error | Behavior | Client Recovery |
|---|---|---|
| Authentication expired | Stream does not start; HTTP 401 | Refresh token and retry |
| Rate limit exceeded | Type `3` error mid-stream or HTTP 429 | Exponential backoff and retry |
| Claude API error | Type `3` error mid-stream | Display error to user |
| Network disconnection | Stream terminates unexpectedly | Auto-reconnect with retry |
| Tool execution failure | Type `3` error or tool result with error | Display tool error in context |
| Token limit exceeded | Stream ends with `finish_reason: "length"` | Prompt user to continue |

## Connection Timeouts

| Parameter | Value |
|---|---|
| SSE connection timeout | 300 seconds (5 minutes) |
| Keep-alive interval | 30 seconds (empty comment line) |
| Client read timeout | 60 seconds (recommended) |
| Maximum stream duration | 300 seconds |

---

Potomac Fund Management
2026

Developed by Sohaib Ali

Special Thanks:
Manish Khatta, Will Gray, Harley Rothfeld, and Dan Russo

potomac.com
