import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { NodeConfig } from '../store/reducers';
import { NodeDefinition, loadDefinitions } from './node-definition';
import { definitionsBridge } from './definitions-bridge';
import { bundledDefinitions } from './bundled-definitions';

@Injectable({
  providedIn: 'root',
})
export class NodeDefinitionService {
  private definitions: NodeDefinition[] = bundledDefinitions;

  // Replaces the bundled fallback with the contents of the definitions folder.
  // No-op without the Electron bridge, so unit tests and the browser under
  // `ng serve` keep working off the bundled set. Awaited by an app initializer,
  // which is what lets getDefinitions() stay synchronous for consumers.
  async load(): Promise<void> {
    const bridge = definitionsBridge();
    if (!bridge) {
      return;
    }

    const { entries, errors } = await bridge.readDefinitions();
    for (const error of errors) {
      console.warn(`[NodeDefinitionService] ${error.file}: ${error.message}`);
    }

    const loaded = loadDefinitions(entries);
    for (const error of loaded.errors) {
      console.warn(`[NodeDefinitionService] ${error.file}: ${error.message}`);
    }

    this.definitions = loaded.definitions;
  }

  getDefinitions(): NodeDefinition[] {
    return this.definitions;
  }

  getDefinition(type: string): NodeDefinition | undefined {
    return this.definitions.find(def => def.type === type);
  }

  buildConfig(def: NodeDefinition): NodeConfig {
    const config: NodeConfig = {};

    for (const control of def.controls ?? []) {
      config[control.key] = control.default;
    }

    if (def.inputs?.length) {
      config.inputs = {};
      for (const input of def.inputs) {
        config.inputs[input.key] = uuidv4();
      }
    }

    if (def.outputs?.length) {
      config.outputs = {};
      for (const output of def.outputs) {
        config.outputs[output.key] = uuidv4();
      }
    }

    return config;
  }
}
