import { validateNodes, loadDefinitions, NodesFile } from './node-definition';

describe('validateNodes', () => {
  it('should return no errors for a valid file', () => {
    const file: NodesFile = {
      nodes: [
        {
          type: 'vco',
          label: 'VCO',
          inputs: [{ key: 'cv', label: 'V/Oct' }],
          outputs: [{ key: 'out', label: 'OUT', multiple: true }],
          controls: [
            { type: 'range', key: 'frequency', label: 'Freq', default: 440, min: 20, max: 2000, step: 1 },
            { type: 'select', key: 'waveform', label: 'Wave', default: 'sine', options: [{ value: 'sine', label: 'Sine' }] },
          ],
        },
      ],
    };

    expect(validateNodes(file)).toEqual([]);
  });

  it('should report a duplicate node type', () => {
    const file: NodesFile = {
      nodes: [
        { type: 'vco', label: 'VCO' },
        { type: 'vco', label: 'VCO Again' },
      ],
    };

    const errors = validateNodes(file);
    expect(errors.length).toBe(1);
    expect(errors[0].node).toBe('vco');
  });

  it('should report a duplicate input port key within a node', () => {
    const file: NodesFile = {
      nodes: [
        {
          type: 'vco',
          label: 'VCO',
          inputs: [
            { key: 'cv', label: 'V/Oct' },
            { key: 'cv', label: 'CV' },
          ],
        },
      ],
    };

    const errors = validateNodes(file);
    expect(errors.length).toBe(1);
    expect(errors[0].node).toBe('vco');
    expect(errors[0].message).toContain('input');
  });

  it('should report a duplicate control key within a node', () => {
    const file: NodesFile = {
      nodes: [
        {
          type: 'vco',
          label: 'VCO',
          controls: [
            { type: 'range', key: 'frequency', label: 'Freq', default: 440, min: 20, max: 2000, step: 1 },
            { type: 'range', key: 'frequency', label: 'Freq 2', default: 220, min: 20, max: 2000, step: 1 },
          ],
        },
      ],
    };

    const errors = validateNodes(file);
    expect(errors.length).toBe(1);
    expect(errors[0].node).toBe('vco');
    expect(errors[0].message).toContain('control');
  });

  it('should report an unknown control type', () => {
    const file: NodesFile = {
      nodes: [
        {
          type: 'vco',
          label: 'VCO',
          controls: [{ type: 'toggle', key: 'on', label: 'On', default: false } as never],
        },
      ],
    };

    const errors = validateNodes(file);
    expect(errors.length).toBe(1);
    expect(errors[0].node).toBe('vco');
    expect(errors[0].message).toContain('toggle');
  });

  it('should report a range control missing max', () => {
    const file: NodesFile = {
      nodes: [
        {
          type: 'vco',
          label: 'VCO',
          controls: [{ type: 'range', key: 'frequency', label: 'Freq', default: 440, min: 20, step: 1 } as never],
        },
      ],
    };

    const errors = validateNodes(file);
    expect(errors.length).toBe(1);
    expect(errors[0].node).toBe('vco');
    expect(errors[0].message).toContain('max');
  });

  it('should report a duplicate output port key within a node', () => {
    const file: NodesFile = {
      nodes: [
        {
          type: 'vco',
          label: 'VCO',
          outputs: [
            { key: 'out', label: 'OUT' },
            { key: 'out', label: 'OUT 2' },
          ],
        },
      ],
    };

    const errors = validateNodes(file);
    expect(errors.length).toBe(1);
    expect(errors[0].node).toBe('vco');
    expect(errors[0].message).toContain('output');
  });

  it('should report a range control missing min', () => {
    const file: NodesFile = {
      nodes: [
        {
          type: 'vco',
          label: 'VCO',
          controls: [{ type: 'range', key: 'frequency', label: 'Freq', default: 440, max: 2000, step: 1 } as never],
        },
      ],
    };

    const errors = validateNodes(file);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain('min');
  });

  it('should report a range control missing step', () => {
    const file: NodesFile = {
      nodes: [
        {
          type: 'vco',
          label: 'VCO',
          controls: [{ type: 'range', key: 'frequency', label: 'Freq', default: 440, min: 20, max: 2000 } as never],
        },
      ],
    };

    const errors = validateNodes(file);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain('step');
  });

  it('should report a select control without options', () => {
    const file: NodesFile = {
      nodes: [
        {
          type: 'vco',
          label: 'VCO',
          controls: [{ type: 'select', key: 'waveform', label: 'Wave', default: 'sine', options: [] }],
        },
      ],
    };

    const errors = validateNodes(file);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain('options');
  });

  it('should report a node missing a type', () => {
    const file: NodesFile = {
      nodes: [{ label: 'VCO' } as never],
    };

    const errors = validateNodes(file);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain('type');
  });

  it('should report a node missing a label', () => {
    const file: NodesFile = {
      nodes: [{ type: 'vco' } as never],
    };

    const errors = validateNodes(file);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain('label');
  });

  it('should accept hardware metadata on a node and its ports', () => {
    const file: NodesFile = {
      nodes: [
        {
          type: 'fast_analog_out',
          label: 'Fast Analog Out',
          hw: { id: 1, namePrefix: 'ao' },
          outputs: [{ key: 'out', label: 'Out', hwPortName: 'out' }],
        },
      ],
    };

    expect(validateNodes(file)).toEqual([]);
  });

  it('should report hardware metadata with a non-numeric module id', () => {
    const file: NodesFile = {
      nodes: [
        {
          type: 'fast_analog_out',
          label: 'Fast Analog Out',
          hw: { id: 'one', namePrefix: 'ao' } as never,
        },
      ],
    };

    const errors = validateNodes(file);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain('hw.id');
  });

  it('should report hardware metadata with an empty name prefix', () => {
    const file: NodesFile = {
      nodes: [
        {
          type: 'fast_analog_out',
          label: 'Fast Analog Out',
          hw: { id: 1, namePrefix: '' },
        },
      ],
    };

    const errors = validateNodes(file);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain('hw.namePrefix');
  });
});

describe('loadDefinitions', () => {
  it('should return one definition per valid file, in input order', () => {
    const result = loadDefinitions([
      { file: 'vco.json', json: { type: 'vco', label: 'VCO' } },
      { file: 'lfo.json', json: { type: 'lfo', label: 'LFO' } },
    ]);

    expect(result.errors).toEqual([]);
    expect(result.definitions.map(d => d.type)).toEqual(['vco', 'lfo']);
  });

  it('should skip an invalid file and report which file was at fault', () => {
    const result = loadDefinitions([
      { file: 'vco.json', json: { type: 'vco', label: 'VCO' } },
      { file: 'broken.json', json: { type: 'broken' } },
    ]);

    expect(result.definitions.map(d => d.type)).toEqual(['vco']);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].file).toBe('broken.json');
    expect(result.errors[0].message).toContain('label');
  });

  it('should reject the second file when two files declare the same node type', () => {
    const result = loadDefinitions([
      { file: 'vco.json', json: { type: 'vco', label: 'VCO' } },
      { file: 'vco-copy.json', json: { type: 'vco', label: 'VCO Again' } },
    ]);

    expect(result.definitions.length).toBe(1);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].file).toBe('vco-copy.json');
    expect(result.errors[0].message).toContain('duplicate');
    expect(result.errors[0].message).toContain('vco.json');
  });

  it('should skip a file that does not contain a JSON object', () => {
    const result = loadDefinitions([
      { file: 'vco.json', json: { type: 'vco', label: 'VCO' } },
      { file: 'list.json', json: [{ type: 'vco' }] },
      { file: 'null.json', json: null },
    ]);

    expect(result.definitions.map(d => d.type)).toEqual(['vco']);
    expect(result.errors.map(e => e.file)).toEqual(['list.json', 'null.json']);
  });
});
