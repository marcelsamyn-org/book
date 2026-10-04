/**
 * The persona selection figure for "Language Models are Screenplay Writers":
 * pre-training teaches the model every AI character it reads about, and
 * post-training refines one of them, the Assistant, pulling it toward some of
 * those characters and away from others (Marks, Lindsey and Olah 2026).
 *
 * The site component and the ebook renderer share the labels below so the
 * three outputs tell the same story.
 */

export type Pull = "toward" | "away";

export interface Persona {
  readonly name: string;
  /** Where the model met this character, e.g. "2001: A Space Odyssey". */
  readonly from: string;
  /** One line on how the character behaves. */
  readonly trait: string;
  /** Whether post-training makes the Assistant more or less like this character. */
  readonly pull: Pull;
}

export interface PersonaSelectionSpec {
  readonly personas: readonly Persona[];
}

export const personaEyebrow = "Where the Assistant’s character comes from";

export const personaStages = {
  pretraining: {
    step: "1 · Pre-training",
    title: "It reads about every AI character we ever wrote",
  },
  posttraining: {
    step: "2 · Post-training",
    title: "Millions of example conversations shape one of them: the Assistant",
  },
} as const;

export const assistantNames = "Claude · ChatGPT · Copilot";

export const pullLabels: Readonly<Record<Pull, string>> = {
  toward: "More like",
  away: "Less like",
};

export const personasPulled = (personas: readonly Persona[], pull: Pull): readonly Persona[] =>
  personas.filter((persona) => persona.pull === pull);
