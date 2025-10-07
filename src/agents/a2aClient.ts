import { randomUUID } from "node:crypto";
import type { RequestOptions } from "node:http";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { URL } from "node:url";
import { z } from "zod";
import { ResearchConfig } from "../config.js";

export interface A2ARequest {
  readonly taskId?: string;
  readonly prompt: string;
}

export interface A2AArtifact {
  readonly name: string;
  readonly text: string;
  readonly usedQueries: readonly string[];
  readonly usedSources: readonly string[];
}

export interface A2AResult {
  readonly taskId: string;
  readonly state: "completed" | "failed";
  readonly message: string;
  readonly artifact?: A2AArtifact;
}

const responseSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number(), z.null()]),
  result: z
    .object({
      id: z.string(),
      status: z.object({
        state: z.union([
          z.literal("pending"),
          z.literal("running"),
          z.literal("completed"),
          z.literal("failed"),
        ]),
        timestamp: z.string(),
        message: z
          .object({
            role: z.string(),
            parts: z.array(
              z.object({
                type: z.string(),
                text: z.string().optional(),
              }),
            ),
          })
          .optional(),
      }),
      artifacts: z.array(
        z.object({
          name: z.string(),
          parts: z.array(
            z.object({
              type: z.literal("text"),
              text: z.string(),
            }),
          ),
          metadata: z
            .object({
              usedQueries: z.array(z.string()).optional(),
              usedSources: z.array(z.string()).optional(),
            })
            .optional(),
        }),
      ),
    })
    .optional(),
  error: z
    .object({
      code: z.number(),
      message: z.string(),
    })
    .optional(),
});

interface HttpJsonResponse {
  readonly statusCode: number;
  readonly body: string;
}

const postJson = async (
  endpoint: string,
  payload: unknown,
  timeoutMs: number,
): Promise<HttpJsonResponse> => {
  const url = new URL(endpoint);
  const serializedPayload = JSON.stringify(payload);
  const path = url.pathname === "" ? "/" : url.pathname;
  const options: RequestOptions = {
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port === "" ? undefined : Number(url.port),
    path: `${path}${url.search}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(serializedPayload, "utf8").toString(),
    },
  };

  const requestFn = url.protocol === "https:" ? httpsRequest : httpRequest;

  return await new Promise<HttpJsonResponse>((resolve, reject) => {
    const request = requestFn(options, (response) => {
      const chunks: Buffer[] = [];

      response.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      response.on("end", () => {
        const statusCode = response.statusCode ?? 0;
        const body = Buffer.concat(chunks).toString("utf8");
        resolve({ statusCode, body });
      });

      response.on("error", (error) => {
        reject(error);
      });
    });

    request.on("error", (error) => {
      reject(error);
    });

    if (timeoutMs > 0) {
      request.setTimeout(timeoutMs, () => {
        request.destroy(new Error(`A2A agent request exceeded configured timeout of ${timeoutMs}ms`));
      });
    }

    request.write(serializedPayload);
    request.end();
  });
};

export class A2AClient {
  constructor(private readonly config: ResearchConfig) {}

  async runResearch(request: A2ARequest): Promise<A2AResult> {
    const taskId = request.taskId ?? randomUUID();
    const rpcRequest = {
      jsonrpc: "2.0" as const,
      method: "tasks/send" as const,
      id: taskId,
      params: {
        id: taskId,
        message: {
          role: "user",
          parts: [
            {
              type: "text" as const,
              text: request.prompt,
            },
          ],
        },
      },
    };

    let httpResponse: HttpJsonResponse;
    try {
      httpResponse = await postJson(
        this.config.a2aEndpoint,
        rpcRequest,
        this.config.execution.researchRequestTimeoutMs,
      );
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(String(error));
    }

    if (httpResponse.statusCode < 200 || httpResponse.statusCode >= 300) {
      throw new Error(
        `A2A agent request failed with status ${httpResponse.statusCode}`,
      );
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(httpResponse.body);
    } catch (error) {
      throw new Error(
        "A2A agent returned invalid JSON response",
        error instanceof Error ? { cause: error } : undefined,
      );
    }

    const payload = responseSchema.parse(parsedBody);

    if (payload.error) {
      return {
        taskId,
        state: "failed",
        message: payload.error.message,
      };
    }

    const result = payload.result;
    if (!result) {
      return {
        taskId,
        state: "failed",
        message: "A2A agent returned empty result",
      };
    }

    const messageText = result.status.message?.parts
      .map((part) => part.text)
      .filter((text): text is string => Boolean(text))
      .join("\n") ?? "";

    if (result.status.state !== "completed") {
      return {
        taskId,
        state: result.status.state === "failed" ? "failed" : "failed",
        message: messageText || `Task ended with state ${result.status.state}`,
      };
    }

    const report = result.artifacts.find((artifact) => artifact.name === "report.md") ?? result.artifacts[0];
    if (!report) {
      return {
        taskId,
        state: "failed",
        message: "A2A agent response did not include a report artifact",
      };
    }

    const textPart = report.parts.find((part) => part.type === "text");
    if (!textPart) {
      return {
        taskId,
        state: "failed",
        message: "Report artifact missing text content",
      };
    }

    return {
      taskId,
      state: "completed",
      message: messageText || "Research complete",
      artifact: {
        name: report.name,
        text: textPart.text,
        usedQueries: report.metadata?.usedQueries ?? [],
        usedSources: report.metadata?.usedSources ?? [],
      },
    };
  }
}
