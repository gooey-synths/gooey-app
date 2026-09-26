import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { NodeConfig } from '../store/reducers';
import { NodeDefinition } from './node-definition';
import { bundledDefinitions } from './bundled-definitions';

@Injectable({
  providedIn: 'root',
})
export class NodeDefinitionService {
  private definitions: NodeDefinition[] = bundledDefinitions;

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
