declare module "@opentui/core" {
  import { EventEmitter } from "events";

  export interface CliRendererConfig {
    exitOnCtrlC?: boolean;
    targetFps?: number;
  }

  export type ParsedKey = {
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
    raw: string;
    sequence: string;
  };

   export class CliRenderer extends EventEmitter<{ keypress: [ParsedKey] }> {
     readonly root: {
       add(renderable: TextRenderable): void;
     };
     readonly keyInput: EventEmitter<{ keypress: [ParsedKey] }>;
     setBackgroundColor(color: string): void;
     requestRender(): void;
     requestLive(): void;
     dropLive(): void;
     setFrameCallback(callback: (deltaTime: number) => Promise<void>): void;
     removeFrameCallback(callback: (deltaTime: number) => Promise<void>): void;
     destroy(): void;
   }


  export interface TextRenderableOptions {
    id?: string;
    content?: string;
    fg?: string;
    margin?: number;
    marginLeft?: number;
    marginRight?: number;
  }

  export class TextRenderable {
    constructor(renderer: CliRenderer, options?: TextRenderableOptions);
    content: string;
    fg?: string;
    margin?: number;
    marginLeft?: number;
    marginRight?: number;
  }

  export function createCliRenderer(config?: CliRendererConfig): Promise<CliRenderer>;
}
