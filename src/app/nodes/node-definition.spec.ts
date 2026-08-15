import { validateNodes, NodesFile } from './node-definition';

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

  it('should report a node missing a label', () => {
    const file: NodesFile = {
      nodes: [{ type: 'vco' } as never],
    };

    const errors = validateNodes(file);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain('label');
  });
});
