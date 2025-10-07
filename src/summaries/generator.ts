import OpenAI from "openai";
import type { ResponseFormatTextJSONSchemaConfig } from "openai/resources/responses/responses";
import { z } from "zod";
import { ResearchConfig } from "../config.js";
import type { ResearchQuestionRecord } from "../tracking/types.js";

interface ReportSummarySchema {
  readonly keyPoints: readonly string[];
}

interface ChapterSummarySchema {
  readonly keyPoints: readonly string[];
}

export interface SummaryContext {
  readonly bookOverview?: string | null;
}

export interface ChapterContextDetails {
  readonly partTitle?: string | null;
  readonly partDescription?: string | null;
  readonly chapterSummary?: string | null;
}

const reportSummarySchema = z.object({
  keyPoints: z.array(z.string().trim().min(1)).min(1),
});

const chapterSummarySchema = z.object({
  keyPoints: z.array(z.string().trim().min(1)).min(1),
});

const outputSchema = z.object({
  output_text: z.string().min(1),
});

export class ReportSummaryGenerator {
  private readonly client: OpenAI;

  constructor(
    private readonly config: ResearchConfig,
    private readonly context: SummaryContext = {},
  ) {
    const apiKey = process.env[this.config.openAI.apiKeyEnvVar];
    if (!apiKey) {
      throw new Error(
        `Missing OpenAI API key. Expected environment variable ${this.config.openAI.apiKeyEnvVar}.`,
      );
    }
    this.client = new OpenAI({ apiKey });
  }

  async generate(
    question: ResearchQuestionRecord,
    report: string,
    chapterContext?: ChapterContextDetails,
  ): Promise<ReportSummarySchema> {
    const format: ResponseFormatTextJSONSchemaConfig = {
      name: "report_summary",
      type: "json_schema",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["keyPoints"],
        properties: {
          keyPoints: {
            type: "array",
            minItems: 3,
            maxItems: 8,
            items: { type: "string", minLength: 1 },
          },
        },
      },
    };

    const response = await this.client.responses.create({
      model: this.config.models.reportSummaries,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "Summarize the research report into concise bullet points capturing the most decision-relevant findings. Use plain language. Respond only with the specified JSON schema.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: this.buildPrompt(question, report, chapterContext),
            },
          ],
        },
      ],
      text: { format },
    });

    const parsed = outputSchema.parse(response);
    const summary = reportSummarySchema.parse(JSON.parse(parsed.output_text));
    return summary;
  }

  private buildPrompt(
    question: ResearchQuestionRecord,
    report: string,
    chapterContext?: ChapterContextDetails,
  ): string {
    const segments: string[] = [];
    if (this.context.bookOverview && this.context.bookOverview.trim().length > 0) {
      segments.push("Book Overview:", this.context.bookOverview.trim());
    }

    if (chapterContext?.partTitle) {
      segments.push("Part Title:", chapterContext.partTitle.trim());
      if (chapterContext.partDescription && chapterContext.partDescription.trim().length > 0) {
        segments.push("Part Overview:", chapterContext.partDescription.trim());
      }
    }

    segments.push(`Chapter Context: ${question.chapterTitle}`);
    if (chapterContext?.chapterSummary && chapterContext.chapterSummary.trim().length > 0) {
      segments.push("Chapter Summary:", chapterContext.chapterSummary.trim());
    }

    segments.push(`Research Question: ${question.prompt}`);
    segments.push("Full Report:");
    segments.push(report);
    segments.push(
      "Extract 3-8 critical bullet points the author must remember when writing the chapter. Each bullet must be a single sentence fragment tied to the chapter goals.",
    );

    return segments.join("\n\n");
  }
}

export class ChapterSummaryGenerator {
  private readonly client: OpenAI;

  constructor(
    private readonly config: ResearchConfig,
    private readonly context: SummaryContext = {},
  ) {
    const apiKey = process.env[this.config.openAI.apiKeyEnvVar];
    if (!apiKey) {
      throw new Error(
        `Missing OpenAI API key. Expected environment variable ${this.config.openAI.apiKeyEnvVar}.`,
      );
    }
    this.client = new OpenAI({ apiKey });
  }

  async deduplicate(
    chapterTitle: string,
    reportSummaries: readonly { question: ResearchQuestionRecord; keyPoints: readonly string[] }[],
    chapterContext?: ChapterContextDetails,
  ): Promise<ChapterSummarySchema> {
    const format: ResponseFormatTextJSONSchemaConfig = {
      name: "chapter_key_points",
      type: "json_schema",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["keyPoints"],
        properties: {
          keyPoints: {
            type: "array",
            minItems: 3,
            maxItems: 10,
            items: { type: "string", minLength: 1 },
          },
        },
      },
    };

    const response = await this.client.responses.create({
      model: this.config.models.chapterSummaries,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "Combine overlapping bullet points into a unified, deduplicated list. Ensure each item is unique, actionable, and tightly phrased.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: this.buildPrompt(chapterTitle, reportSummaries, chapterContext),
            },
          ],
        },
      ],
      text: { format },
    });

    const parsed = outputSchema.parse(response);
    const summary = chapterSummarySchema.parse(JSON.parse(parsed.output_text));
    return summary;
  }

  private buildPrompt(
    chapterTitle: string,
    reportSummaries: readonly { question: ResearchQuestionRecord; keyPoints: readonly string[] }[],
    chapterContext?: ChapterContextDetails,
  ): string {
    const parts = reportSummaries.map((entry, index) => {
      const numbered = entry.keyPoints.map((point, idx) => `    ${idx + 1}. ${point}`).join("\n");
      return `Report ${index + 1}: ${entry.question.prompt}\n${numbered}`;
    });

    const segments: string[] = [];
    if (this.context.bookOverview && this.context.bookOverview.trim().length > 0) {
      segments.push("Book Overview:", this.context.bookOverview.trim());
    }

    if (chapterContext?.partTitle) {
      segments.push("Part Title:", chapterContext.partTitle.trim());
      if (chapterContext.partDescription && chapterContext.partDescription.trim().length > 0) {
        segments.push("Part Overview:", chapterContext.partDescription.trim());
      }
    }

    segments.push(`Chapter: ${chapterTitle}`);
    if (chapterContext?.chapterSummary && chapterContext.chapterSummary.trim().length > 0) {
      segments.push("Chapter Summary:", chapterContext.chapterSummary.trim());
    }

    segments.push(
      "Below are bullet point summaries extracted from multiple research reports. Merge them into a single list without duplicates, keeping the most critical insights. Return 3-10 items and ensure they align with the overarching book narrative.",
    );
    segments.push(parts.join("\n\n"));

    return segments.join("\n\n");
  }
}
