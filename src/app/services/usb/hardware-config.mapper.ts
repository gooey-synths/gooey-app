import { FlowchartState, SynthNode } from '../../store/reducers';
import { ModuleDescriptor } from './module-descriptor';
import { resolveTransform, TransformRegistry } from './arg-transforms';

export interface HardwareModule {
  id: number;
  args: Record<string, string>;
}

export interface HardwareConnection {
  input_mod: number;
  input_port_name: string;
  output_mod: number;
  output_port_name: string;
}

export interface GraphDescription {
  modules: HardwareModule[];
  connections: HardwareConnection[];
}

export class HardwareConfigMapperError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HardwareConfigMapperError';
  }
}

export function validateGraphDescription(graph: GraphDescription): void {
  for (let i = 0; i < graph.modules.length; i++) {
    const module = graph.modules[i];
    if (!Number.isFinite(module.id)) {
      throw new HardwareConfigMapperError(`module ${i} id is not a finite number`);
    }
    if (!module.args || typeof module.args !== 'object') {
      throw new HardwareConfigMapperError(`module ${i} has no args map`);
    }
  }

  for (const connection of graph.connections) {
    if (!connection.input_port_name) {
      throw new HardwareConfigMapperError('connection has an empty input port name');
    }
    if (!connection.output_port_name) {
      throw new HardwareConfigMapperError('connection has an empty output port name');
    }
  }
}

interface NodeRoster {
  descriptor: ModuleDescriptor;
  node: SynthNode;
  index: number;
}

export class HardwareConfigMapper {
  constructor(private transforms: TransformRegistry = {}) {}

  toHardwareConfig(state: FlowchartState, descriptors: ModuleDescriptor[]): GraphDescription {
    const byType = new Map(descriptors.map((d) => [d.type, d]));

    const roster: NodeRoster[] = state.nodes.map((node, index) => {
      const descriptor = byType.get(node.type);
      if (!descriptor) {
        throw new HardwareConfigMapperError(`unknown node type: ${node.type}`);
      }
      return { descriptor, node, index };
    });

    const modules = roster.map(({ descriptor, node }) => ({
      id: descriptor.hwModuleId,
      args: this.buildArgs(descriptor, node),
    }));

    const connections = state.connections.map((connection) =>
      this.resolveConnection(connection.start, connection.end, roster),
    );

    return { modules, connections };
  }

  private buildArgs(descriptor: ModuleDescriptor, node: SynthNode): Record<string, string> {
    const args: Record<string, string> = {};
    for (const [configKey, mapping] of Object.entries(descriptor.args)) {
      const raw = (node.config as Record<string, unknown>)[configKey];
      if (raw === undefined) {
        continue;
      }
      const transform = resolveTransform(mapping.transform, this.transforms);
      args[mapping.key] = transform(raw);
    }
    return args;
  }

  private resolveConnection(
    startUuid: string,
    endUuid: string,
    roster: NodeRoster[],
  ): HardwareConnection {
    const { index: outputMod, hwPortName: outputPort } = this.locatePort(
      startUuid,
      roster,
      'output',
    );
    const { index: inputMod, hwPortName: inputPort } = this.locatePort(endUuid, roster, 'input');

    return {
      input_mod: inputMod,
      input_port_name: inputPort,
      output_mod: outputMod,
      output_port_name: outputPort,
    };
  }

  private locatePort(
    uuid: string,
    roster: NodeRoster[],
    direction: 'input' | 'output',
  ): { index: number; hwPortName: string } {
    for (const entry of roster) {
      const appPortName = this.findAppPortName(entry.node, uuid, direction);
      if (appPortName !== undefined) {
        const ports = direction === 'input' ? entry.descriptor.inputs : entry.descriptor.outputs;
        const port = ports.find((p) => p.name === appPortName);
        return { index: entry.index, hwPortName: port ? port.hwPortName : appPortName };
      }
    }
    throw new HardwareConfigMapperError(
      `unknown ${direction} port uuid: ${uuid}; exposed ports: ${roster
        .flatMap((e) => Object.keys(this.portMap(e.node, direction)))
        .join(', ') || 'none'}`,
    );
  }

  private findAppPortName(
    node: SynthNode,
    uuid: string,
    direction: 'input' | 'output',
  ): string | undefined {
    const portMap = this.portMap(node, direction);
    const entry = Object.entries(portMap).find(([, value]) => value === uuid);
    return entry ? entry[0] : undefined;
  }

  private portMap(node: SynthNode, direction: 'input' | 'output'): Record<string, string> {
    const config = node.config as Record<string, unknown>;
    const ports = config[direction === 'input' ? 'inputs' : 'outputs'];
    return (ports as Record<string, string> | undefined) ?? {};
  }
}
