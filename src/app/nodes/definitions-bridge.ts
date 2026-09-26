import { RawDefinition } from './node-definition';

export interface DefinitionsReadError {
  file: string;
  message: string;
}

export interface DefinitionsReadResult {
  entries: RawDefinition[];
  errors: DefinitionsReadError[];
}

// The shape electron/preload.js puts on window via contextBridge. Absent in a
// plain browser and under Karma, which is what selects the bundled fallback.
export interface DefinitionsBridge {
  readDefinitions(): Promise<DefinitionsReadResult>;
}

export function definitionsBridge(): DefinitionsBridge | undefined {
  return (globalThis as { gooey?: DefinitionsBridge }).gooey;
}
