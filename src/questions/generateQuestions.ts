import OpenAI from "openai";
import { z } from "zod";
import type { ResponseFormatTextJSONSchemaConfig } from "openai/resources/responses/responses";
import { ResearchConfig } from "../config.js";
import { ChapterOutline } from "../md/chapters.js";
import { ResearchQuestionCandidate } from "./types.js";

const questionSchema = z.object({
  question: z.string().trim().min(1),
  justification: z.string().trim().min(1),
});

const questionsPayloadSchema = z.object({
  questions: z.array(questionSchema).min(1),
});

const outputTextSchema = z.object({
  output_text: z.string().min(1),
});

export interface ChapterQuestionContext {
  readonly bookOverview?: string | null;
  readonly partTitle?: string | null;
  readonly partDescription?: string | null;
  readonly chapterSummary: string;
}

export class QuestionGenerator {
  private readonly client: OpenAI;

  constructor(private readonly config: ResearchConfig) {
    const apiKey = process.env[this.config.openAI.apiKeyEnvVar];
    if (!apiKey) {
      throw new Error(
        `Missing OpenAI API key. Expected environment variable ${this.config.openAI.apiKeyEnvVar}.`,
      );
    }

    this.client = new OpenAI({ apiKey });
  }

  async generateForChapter(
    chapter: ChapterOutline,
    context: ChapterQuestionContext,
  ): Promise<ResearchQuestionCandidate[]> {
    const responseFormat: ResponseFormatTextJSONSchemaConfig = {
      name: "chapter_questions",
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["questions"],
        properties: {
          questions: {
            type: "array",
            minItems: 1,
            maxItems: this.config.questionGeneration.perChapterLimit,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["question", "justification"],
              properties: {
                question: { type: "string", minLength: 1 },
                justification: { type: "string", minLength: 1 },
              },
            },
          },
        },
      },
      strict: true,
      type: "json_schema",
    };

    const response = await this.client.responses.create({
      model: this.config.models.questionGeneration,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You generate questions to research for a book author. Respond exclusively in the requested JSON format.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: this.buildPrompt(chapter, context),
            },
          ],
        },
      ],
      text: {
        format: responseFormat,
      },
    });

    const serialized = this.extractJsonString(response);
    const parsed = questionsPayloadSchema.parse(JSON.parse(serialized));
    return parsed.questions;
  }

  private buildPrompt(
    chapter: ChapterOutline,
    context: ChapterQuestionContext,
  ): string {
    const segments: string[] = [];
    if (context.bookOverview && context.bookOverview.trim().length > 0) {
      segments.push("Book Overview:", context.bookOverview.trim());
    }

    if (context.partTitle) {
      segments.push("Part Title:", context.partTitle.trim());
      if (context.partDescription && context.partDescription.trim().length > 0) {
        segments.push("Part Overview:", context.partDescription.trim());
      }
    }

    segments.push("Chapter Title:", chapter.title);
    segments.push("Chapter Summary:", context.chapterSummary.trim());
    segments.push("Chapter Outline:", chapter.narrative.trim());
    segments.push(
      `Generate up to ${this.config.questionGeneration.perChapterLimit} questions that, when researched or developed, will strengthen this chapter with evidence, counterarguments, or compelling new angles.`,
    );
    segments.push(
      "Each question must be sharply scoped, researchable in a single deep dive, and include a concise justification that connects back to the chapter goals.",
    );

    return segments.join("\n\n");
  }

  private extractJsonString(response: unknown): string {
    const parsed = outputTextSchema.parse(response);
    return parsed.output_text;
  }
}
