import { HardwareConfigMapper, validateGraphDescription } from './hardware-config.mapper';
import { createModuleDescriptor, ModuleDescriptor } from './module-descriptor';
import { FlowchartState, SynthNode } from '../../store/reducers';

const transforms = {
  'gain-x10': (value: unknown) => String((Number(value) || 0) * 10),
};

const vcoDescriptor: ModuleDescriptor = createModuleDescriptor({
  type: 'vco',
  hwModuleId: 1056,
  inputs: [{ name: 'cv', hwPortName: 'cv' }],
  outputs: [{ name: 'out', hwPortName: 'analog' }],
  args: {
    frequency: { key: 'center_freq' },
    waveform: { key: 'wave' },
    gain: { key: 'gain', transform: 'gain-x10' },
  },
});

const envelopeDescriptor: ModuleDescriptor = createModuleDescriptor({
  type: 'envelope',
  hwModuleId: 103,
  inputs: [],
  outputs: [{ name: 'out', hwPortName: 'out' }],
  args: { attack: { key: 'attack' } },
});

const descriptors: ModuleDescriptor[] = [vcoDescriptor, envelopeDescriptor];

const mapper = new HardwareConfigMapper(transforms);

const vcoNode = (id: string, args: Record<string, unknown> = {}): SynthNode => ({
  id,
  type: 'vco',
  position: { x: 0, y: 0 },
  config: {
    waveform: 'sine',
    frequency: 440,
    pw: 0.5,
    inputs: { cv: `cv-${id}` },
    outputs: { out: `out-${id}` },
    ...args,
  },
} as SynthNode);

const envNode = (id: string): SynthNode => ({
  id,
  type: 'envelope',
  position: { x: 0, y: 0 },
  config: {
    attack: 0.01,
    decay: 0.1,
    sustain: 0.7,
    release: 0.2,
    outputs: { out: `out-${id}` },
  },
});

const map = (state: FlowchartState) => mapper.toHardwareConfig(state, descriptors);

describe('HardwareConfigMapper', () => {
  it('emits a module per node with hw ids and string args', () => {
    const result = map({ nodes: [vcoNode('a'), envNode('b')], connections: [] });

    expect(result.modules).toEqual([
      { id: 1056, args: { center_freq: '440', wave: 'sine' } },
      { id: 103, args: { attack: '0.01' } },
    ]);
  });

  it('coerces number and enum args to strings by default', () => {
    const result = map({ nodes: [vcoNode('a')], connections: [] });

    expect(result.modules[0].args).toEqual({ center_freq: '440', wave: 'sine' });
  });

  it('applies a named transform to an arg value', () => {
    const result = map({
      nodes: [vcoNode('a', { gain: 2 })],
      connections: [],
    });

    expect(result.modules[0].args).toEqual({ center_freq: '440', wave: 'sine', gain: '20' });
  });

  it('resolves connection endpoints to (moduleIndex, portName)', () => {
    const result = map({
      nodes: [vcoNode('a'), envNode('b')],
      connections: [{ id: 'conn1', start: 'out-a', end: 'cv-a' }],
    });

    expect(result.connections).toEqual([
      { input_mod: 0, input_port_name: 'cv', output_mod: 0, output_port_name: 'analog' },
    ]);
  });

  it('module indices follow node order', () => {
    const result = map({
      nodes: [envNode('first'), vcoNode('second')],
      connections: [],
    });

    expect(result.modules[0].id).toBe(103);
    expect(result.modules[1].id).toBe(1056);
  });

  it('throws a typed error for an unknown node type', () => {
    const unknown = { ...vcoNode('a'), type: 'not-a-real-node' } as unknown as SynthNode;

    expect(() => map({ nodes: [unknown], connections: [] })).toThrowError(/unknown node type/i);
  });

  it('throws a typed error when a connection references an unknown output port uuid', () => {
    expect(() =>
      map({
        nodes: [vcoNode('a'), envNode('b')],
        connections: [{ id: 'c', start: 'does-not-exist', end: 'cv-a' }],
      }),
    ).toThrowError(/unknown output port/i);
  });

  it('throws a typed error when a connection references an unknown input port uuid', () => {
    expect(() =>
      map({
        nodes: [vcoNode('a'), envNode('b')],
        connections: [{ id: 'c', start: 'out-a', end: 'missing-input' }],
      }),
    ).toThrowError(/unknown input port/i);
  });

  it('passes schema validation for a well-formed result', () => {
    const result = map({ nodes: [vcoNode('a')], connections: [] });

    expect(() => validateGraphDescription(result)).not.toThrow();
  });

  it('rejects a module whose id is not a finite number', () => {
    const result = { modules: [{ id: Number.NaN, args: {} }], connections: [] };

    expect(() => validateGraphDescription(result)).toThrowError(/module.*id/i);
  });

  it('rejects a module with no args map', () => {
    const result = { modules: [{ id: 1056, args: (null as unknown) as Record<string, string> }], connections: [] };

    expect(() => validateGraphDescription(result)).toThrowError(/args/i);
  });

  it('rejects a connection with an empty port name', () => {
    const result = {
      modules: [{ id: 1056, args: {} }, { id: 103, args: {} }],
      connections: [
        { input_mod: 1, input_port_name: 'cv', output_mod: 0, output_port_name: '' },
      ],
    };

    expect(() => validateGraphDescription(result)).toThrowError(/port name/i);
  });
});
