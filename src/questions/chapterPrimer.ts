import OpenAI from "openai";
import type { ResponseFormatTextJSONSchemaConfig } from "openai/resources/responses/responses";
import { z } from "zod";
import { ResearchConfig } from "../config.js";
import type { ChapterOutline } from "../md/chapters.js";

const outputSchema = z.object({
  output_text: z.string().min(1),
});

const primerSchema = z.object({
  summary: z.string().trim().min(40).max(1200),
});

export interface ChapterPrimerContext {
  readonly overview?: string | null;
}

export class ChapterPrimerGenerator {
  private readonly client: OpenAI;

  constructor(private readonly config: ResearchConfig, private readonly context: ChapterPrimerContext) {
    const apiKey = process.env[this.config.openAI.apiKeyEnvVar];
    if (!apiKey) {
      throw new Error(
        `Missing OpenAI API key. Expected environment variable ${this.config.openAI.apiKeyEnvVar}.`,
      );
    }

    this.client = new OpenAI({ apiKey });
  }

  async generate(chapter: ChapterOutline): Promise<string> {
    const format: ResponseFormatTextJSONSchemaConfig = {
      name: "chapter_primer",
      type: "json_schema",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["summary"],
        properties: {
          summary: {
            type: "string",
            minLength: 40,
            maxLength: 1200,
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
              text: "Produce a concise narrative summary that captures the chapter's purpose, scope, and promises for readers. Use 3-5 full sentences, written in second-person plural addressing the author team. Respond only using the provided JSON schema.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: this.buildPrompt(chapter),
            },
          ],
        },
      ],
      text: { format },
    });

    const serialized = outputSchema.parse(response).output_text;
    const parsed = primerSchema.parse(JSON.parse(serialized));
    return parsed.summary;
  }

  private buildPrompt(chapter: ChapterOutline): string {
    const segments: string[] = [];
    if (this.context.overview && this.context.overview.trim().length > 0) {
      segments.push("Book Overview:", this.context.overview.trim());
    }

    if (chapter.partTitle) {
      segments.push("Part Title:", chapter.partTitle.trim());
      if (chapter.partDescription) {
        segments.push("Part Overview:", chapter.partDescription.trim());
      }
    }

    segments.push("Chapter Title:", chapter.title.trim());
    segments.push("Chapter Content:", chapter.narrative.trim());
    segments.push(
      "Write a tight summary (3-5 sentences) that highlights how this chapter advances the promises of its part, the stakes for the reader, and the evidence or arguments it plans to develop. Emphasize what the research team should keep in mind when proposing supporting research questions.",
    );

    return segments.join("\n\n");
  }
}
