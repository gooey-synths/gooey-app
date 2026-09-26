import { TestBed } from '@angular/core/testing';
import { NodeDefinitionService } from './node-definition.service';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  it('getDefinitions() should return the definitions from the JSON file', () => {
    const defs = service.getDefinitions();

    expect(defs.length).toBe(3);
    expect(defs.map(d => d.type)).toEqual(['vco', 'envelope', 'vca']);
  });

  it('getDefinition() should return the definition for an existing type', () => {
    const def = service.getDefinition('vco');

    expect(def?.label).toBe('VCO');
  });

  it('getDefinition() should return undefined for an unknown type', () => {
    expect(service.getDefinition('nope')).toBeUndefined();
  });

  it('buildConfig() should seed control defaults for a vco', () => {
    const config = service.buildConfig(service.getDefinition('vco')!);

    expect(config['waveform']).toBe('sine');
    expect(config['frequency']).toBe(440);
    expect(config['pw']).toBe(0.5);
  });

  it('buildConfig() should create a uuid per input port', () => {
    const config = service.buildConfig(service.getDefinition('vco')!);

    const inputs = config.inputs!;
    expect(Object.keys(inputs)).toEqual(['cv', 'pwm']);
    expect(inputs['cv']).toMatch(UUID_REGEX);
    expect(inputs['pwm']).toMatch(UUID_REGEX);
  });

  it('buildConfig() should create a uuid per output port', () => {
    const config = service.buildConfig(service.getDefinition('vco')!);

    const outputs = config.outputs!;
    expect(Object.keys(outputs)).toEqual(['out']);
    expect(outputs['out']).toMatch(UUID_REGEX);
  });

  it('buildConfig() should not add outputs for a node without outputs', () => {
    const config = service.buildConfig(service.getDefinition('vca')!);

    expect(config.outputs).toBeUndefined();
    expect(Object.keys(config.inputs!)).toEqual(['audio', 'cv']);
    expect(config.inputs!['audio']).toMatch(UUID_REGEX);
    expect(config.inputs!['cv']).toMatch(UUID_REGEX);
  });

  it('buildConfig() should generate unique uuids across calls', () => {
    const first = service.buildConfig(service.getDefinition('vco')!);
    const second = service.buildConfig(service.getDefinition('vco')!);

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

    expect(service.getDefinitions().map(d => d.type)).toEqual(['vco', 'envelope', 'vca']);
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
