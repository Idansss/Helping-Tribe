type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

const SENSITIVE_KEY_FRAGMENTS = ['authorization', 'cookie', 'password', 'secret', 'token']

function configuredLevel(): LogLevel {
  const value = String(process.env.LOG_LEVEL ?? 'info').trim().toLowerCase()
  if (value === 'debug' || value === 'info' || value === 'warn' || value === 'error') {
    return value
  }
  return 'info'
}

function shouldLog(level: LogLevel) {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[configuredLevel()]
}

function redact(value: unknown, key?: string): unknown {
  const normalizedKey = String(key ?? '').toLowerCase()
  if (normalizedKey && SENSITIVE_KEY_FRAGMENTS.some((fragment) => normalizedKey.includes(fragment))) {
    return '[REDACTED]'
  }

  if (Array.isArray(value)) {
    return value.map((item) => redact(item))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => [
        childKey,
        redact(childValue, childKey),
      ])
    )
  }

  return value
}

export function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...(process.env.NODE_ENV === 'production' ? {} : { stack: error.stack }),
    }
  }

  return { message: String(error) }
}

function writeLog(level: LogLevel, message: string, context?: Record<string, unknown>) {
  if (!shouldLog(level)) return

  const entry = redact({
    level,
    message,
    service: 'helping-tribe-web',
    timestamp: new Date().toISOString(),
    ...(context ?? {}),
  })

  const line = JSON.stringify(entry)
  if (level === 'error') {
    console.error(line)
    return
  }
  if (level === 'warn') {
    console.warn(line)
    return
  }
  console.log(line)
}

export function logInfo(message: string, context?: Record<string, unknown>) {
  writeLog('info', message, context)
}

export function logWarn(message: string, context?: Record<string, unknown>) {
  writeLog('warn', message, context)
}

export function logError(message: string, context?: Record<string, unknown>) {
  writeLog('error', message, context)
}
