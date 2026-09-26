import { TestBed } from '@angular/core/testing';
import { NodeDefinitionService } from './node-definition.service';
import { NodeDefinition } from './node-definition';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A node with controls, ports and non-connectable inputs. None of the shipped
// hardware modules have controls, so the control and multi-port behaviour of
// buildConfig is pinned to this fixture rather than to whatever happens to be
// in definitions/ this month.
const FIXTURE: NodeDefinition = {
  type: 'fixture',
  label: 'Fixture',
  inputs: [
    { key: 'cv', label: 'V/Oct', connectable: false },
    { key: 'pwm', label: 'PWM' },
  ],
  outputs: [{ key: 'out', label: 'OUT' }],
  controls: [
    { type: 'select', key: 'waveform', label: 'Wave', default: 'sine', options: [{ value: 'sine', label: 'Sine' }] },
    { type: 'range', key: 'frequency', label: 'Freq', default: 440, min: 20, max: 2000, step: 1 },
  ],
};

describe('NodeDefinitionService', () => {
  let service: NodeDefinitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeDefinitionService);
  });

  afterEach(() => {
    delete (globalThis as { gooey?: unknown }).gooey;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getDefinitions() should return the definitions from the JSON files', () => {
    const defs = service.getDefinitions();

    expect(defs.map(d => d.type)).toEqual([
      'fast_analog_in',
      'fast_analog_out',
      'fast_digital_in',
      'fast_digital_out',
    ]);
  });

  it('getDefinition() should return the definition for an existing type', () => {
    const def = service.getDefinition('fast_analog_out');

    expect(def?.label).toBe('Fast Analog Out');
  });

  it('should carry the hardware module id and name prefix through to the caller', () => {
    const def = service.getDefinition('fast_analog_in');

    expect(def?.hw).toEqual({ id: 2, namePrefix: 'ai' });
    expect(def?.inputs?.[0].hwPortName).toBe('in');
  });

  it('getDefinition() should return undefined for an unknown type', () => {
    expect(service.getDefinition('nope')).toBeUndefined();
  });

  it('buildConfig() should seed control defaults', () => {
    const config = service.buildConfig(FIXTURE);

    expect(config['waveform']).toBe('sine');
    expect(config['frequency']).toBe(440);
  });

  it('buildConfig() should create a uuid per input port', () => {
    const config = service.buildConfig(FIXTURE);

    const inputs = config.inputs!;
    expect(Object.keys(inputs)).toEqual(['cv', 'pwm']);
    expect(inputs['cv']).toMatch(UUID_REGEX);
    expect(inputs['pwm']).toMatch(UUID_REGEX);
  });

  it('buildConfig() should create a uuid per output port', () => {
    const config = service.buildConfig(FIXTURE);

    const outputs = config.outputs!;
    expect(Object.keys(outputs)).toEqual(['out']);
    expect(outputs['out']).toMatch(UUID_REGEX);
  });

  it('buildConfig() should not add outputs for a node without outputs', () => {
    const config = service.buildConfig(service.getDefinition('fast_analog_in')!);

    expect(config.outputs).toBeUndefined();
    expect(Object.keys(config.inputs!)).toEqual(['in']);
    expect(config.inputs!['in']).toMatch(UUID_REGEX);
  });

  it('buildConfig() should not add controls for a node without controls', () => {
    const config = service.buildConfig(service.getDefinition('fast_analog_out')!);

    expect(Object.keys(config)).toEqual(['outputs']);
  });

  it('buildConfig() should generate unique uuids across calls', () => {
    const first = service.buildConfig(FIXTURE);
    const second = service.buildConfig(FIXTURE);

    expect(first.inputs!['cv']).not.toBe(second.inputs!['cv']);
    expect(first.inputs!['pwm']).not.toBe(second.inputs!['pwm']);
    expect(first.outputs!['out']).not.toBe(second.outputs!['out']);
  });
});

describe('NodeDefinitionService runtime loading', () => {
  let service: NodeDefinitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeDefinitionService);
  });

  afterEach(() => {
    delete (globalThis as { gooey?: unknown }).gooey;
  });

  it('load() should replace the bundled definitions with what the bridge returns', async () => {
    (globalThis as { gooey?: unknown }).gooey = {
      readDefinitions: async () => ({
        entries: [
          { file: 'lfo.json', json: { type: 'lfo', label: 'LFO' } },
          { file: 'vco.json', json: { type: 'vco', label: 'VCO' } },
        ],
        errors: [],
      }),
    };

    await service.load();

    expect(service.getDefinitions().map(d => d.type)).toEqual(['lfo', 'vco']);
    expect(service.getDefinition('lfo')?.label).toBe('LFO');
  });
  it('load() should keep the bundled definitions when there is no bridge', async () => {
    await service.load();

    expect(service.getDefinitions().map(d => d.type)).toEqual([
      'fast_analog_in',
      'fast_analog_out',
      'fast_digital_in',
      'fast_digital_out',
    ]);
  });

  it('load() should skip invalid entries from the bridge but keep the valid ones', async () => {
    (globalThis as { gooey?: unknown }).gooey = {
      readDefinitions: async () => ({
        entries: [
          { file: 'lfo.json', json: { type: 'lfo', label: 'LFO' } },
          { file: 'broken.json', json: { type: 'broken' } },
        ],
        errors: [{ file: 'unparseable.json', message: 'Unexpected token' }],
      }),
    };

    await service.load();

    expect(service.getDefinitions().map(d => d.type)).toEqual(['lfo']);
  });
});
