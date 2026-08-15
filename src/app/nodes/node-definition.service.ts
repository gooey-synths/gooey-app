import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import nodesFile from './nodes.json';
import { NodeConfig } from '../store/reducers';
import { NodeDefinition, NodesFile, validateNodes } from './node-definition';

const nodes = nodesFile as unknown as NodesFile;

@Injectable({
  providedIn: 'root',
})
export class NodeDefinitionService {
  private readonly definitions: NodeDefinition[] = nodes.nodes;

  constructor() {
    for (const error of validateNodes(nodes)) {
      console.warn(`[NodeDefinitionService] ${error.node}: ${error.message}`);
    }
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
