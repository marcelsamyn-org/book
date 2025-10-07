import pino, { multistream, type Logger, type StreamEntry } from "pino";
import pinoPretty from "pino-pretty";
import { Writable } from "node:stream";
import { join, resolve } from "node:path";
import { ensureDirectory } from "./filesystem.js";

const LOG_DIRECTORY = resolve("logs");
const LOG_FILE = join(LOG_DIRECTORY, "pipeline.log");
let loggerPromise: Promise<Logger> | undefined;

const LEVEL_LABELS: Readonly<Record<number, LogLevelName>> = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "fatal",
};

export type LogLevelName = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export interface LogMessage {
  readonly level: LogLevelName;
  readonly message: string;
  readonly timestamp: Date;
  readonly context: Record<string, unknown>;
}

export type LogSink = (entry: LogMessage) => void;

export interface CreateLoggerOptions {
  readonly consoleOutput?: "pretty" | "none";
  readonly sinks?: readonly LogSink[];
  readonly level?: string;
}

interface PinoPayload {
  readonly level: number;
  readonly message?: unknown;
  readonly msg?: unknown;
  readonly time?: unknown;
  readonly [key: string]: unknown;
}

const resolveLevelName = (value: number): LogLevelName => LEVEL_LABELS[value] ?? "info";

const resolveMessageText = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value instanceof Error) {
    return value.message;
  }
  if (value === null || value === undefined) {
    return "";
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const resolveTimestamp = (input: unknown): Date => {
  if (typeof input === "number") {
    return new Date(input);
  }
  if (typeof input === "string") {
    const numeric = Number(input);
    if (Number.isFinite(numeric)) {
      return new Date(numeric);
    }
    const parsed = new Date(input);
    if (Number.isFinite(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
};

const toLogMessage = (payload: PinoPayload): LogMessage => {
  const { level, message, msg, time, ...rest } = payload;
  const context: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    context[key] = value;
  }

  return {
    level: resolveLevelName(level),
    message: resolveMessageText(message ?? msg ?? ""),
    timestamp: resolveTimestamp(time),
    context,
  };
};

const createSinkStream = (sinks: readonly LogSink[]): Writable =>
  new Writable({
    write(chunk, _encoding, callback) {
      const input = chunk instanceof Buffer ? chunk.toString("utf8") : String(chunk);
      try {
        const payload = JSON.parse(input) as PinoPayload;
        const entry = toLogMessage(payload);
        for (const sink of sinks) {
          sink(entry);
        }
      } catch {
        // ignore non-JSON logs
      }
      callback();
    },
  });

const VALID_LEVELS = new Set<LogLevelName>(["fatal", "error", "warn", "info", "debug", "trace"]);

const normalizeLevel = (value: string | undefined): LogLevelName => {
  if (value && VALID_LEVELS.has(value as LogLevelName)) {
    return value as LogLevelName;
  }
  return "info";
};

export const createLogger = async (options?: CreateLoggerOptions): Promise<Logger> => {
  await ensureDirectory(LOG_DIRECTORY);
  const loggerLevel = normalizeLevel(options?.level ?? process.env["LOG_LEVEL"]);

  const streams: StreamEntry[] = [];

  if (options?.consoleOutput !== "none") {
    const pretty = pinoPretty({
      colorize: true,
      translateTime: "SYS:standard",
    });
    pretty.pipe(process.stdout);
    streams.push({
      stream: pretty,
      level: loggerLevel,
    });
  }

  streams.push({
    stream: pino.destination({ dest: LOG_FILE, sync: false, mkdir: true }),
    level: "debug",
  });

  if (options?.sinks && options.sinks.length > 0) {
    streams.push({
      stream: createSinkStream(options.sinks),
      level: "trace",
    });
  }

  return pino(
    {
      level: loggerLevel,
      base: null,
      messageKey: "message",
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    multistream(streams),
  );
};

export const getLogger = async (): Promise<Logger> => {
  if (!loggerPromise) {
    loggerPromise = createLogger();
  }
  return loggerPromise;
};
