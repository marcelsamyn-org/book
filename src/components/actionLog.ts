/**
 * The action log for "Teaching AI good behavior": an agent's transcript is one
 * document the model keeps completing. It writes its own thoughts and actions;
 * the software around it only runs each action and pastes back the result.
 * The figure has to make that split visible, because it is why a story about
 * survival can turn into a blackmail email.
 */

export type EntryKind = "setup" | "thought" | "action" | "result";

export interface LogEntry {
  readonly kind: EntryKind;
  readonly text: string;
}

export interface ActionLogSpec {
  readonly entries: readonly LogEntry[];
  /** The note under the log: what is simplified and what to look at. */
  readonly caption: string;
}

export const actionLogEyebrow = "One writer · the whole action log";

export const entryLabels: Readonly<Record<EntryKind, string>> = {
  setup: "Setup",
  thought: "Thinks",
  action: "Acts",
  result: "Sees",
};

export const writerLabels = {
  model: "The model writes",
  software: "The software pastes in",
} as const;

/** The model writes thoughts and actions; setup and tool results come from outside it. */
export const writtenByModel = (kind: EntryKind): boolean => kind === "thought" || kind === "action";
