import { TestBed } from '@angular/core/testing';
import { NodeDefinitionService } from './node-definition.service';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('NodeDefinitionService', () => {
  let service: NodeDefinitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeDefinitionService);
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
