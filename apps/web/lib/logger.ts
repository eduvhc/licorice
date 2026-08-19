import "server-only"
import { trace } from "@opentelemetry/api"
import pino from "pino"

import { env } from "@/lib/env"

function traceContext() {
  const spanContext = trace.getActiveSpan()?.spanContext()

  if (!spanContext) {
    return {}
  }

  return { trace_id: spanContext.traceId, span_id: spanContext.spanId }
}

export const logger = pino({
  level: env.LOG_LEVEL,
  mixin: traceContext,
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
})
