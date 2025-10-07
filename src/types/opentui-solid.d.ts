declare module "@opentui/solid" {
  import type { CliRenderer, ParsedKey, type CliRendererConfig } from "@opentui/core";
  import type { TestRendererOptions } from "@opentui/core/testing";
  import type { JSX } from "@opentui/solid/jsx-runtime";
  import type { Context } from "solid-js";

  export const render: (node: () => JSX.Element, renderConfig?: CliRendererConfig) => Promise<void>;
  export const testRender: (
    node: () => JSX.Element,
    renderConfig?: TestRendererOptions,
  ) => Promise<{
    renderer: import("@opentui/core/testing").TestRenderer;
    mockInput: import("@opentui/core/testing").MockInput;
    mockMouse: import("@opentui/core/testing").MockMouse;
    renderOnce: () => Promise<void>;
    captureCharFrame: () => string;
    resize: (width: number, height: number) => void;
  }>;

  export const RendererContext: Context<CliRenderer | undefined>;
  export const useRenderer: () => CliRenderer;
  export const useKeyboard: (callback: (key: ParsedKey) => void) => void;
}
