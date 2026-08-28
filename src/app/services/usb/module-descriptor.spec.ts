import { createModuleDescriptor, validateModuleDescriptor } from './module-descriptor';

describe('module-descriptor', () => {
  describe('createModuleDescriptor', () => {
    it('creates a descriptor from type, hwModuleId, ports and args', () => {
      const descriptor = createModuleDescriptor({
        type: 'vco',
        hwModuleId: 1056,
        inputs: [{ name: 'cv', hwPortName: 'cv_in' }],
        outputs: [{ name: 'out', hwPortName: 'out' }],
        args: { frequency: { key: 'freq' } },
      });

      expect(descriptor).toEqual({
        type: 'vco',
        hwModuleId: 1056,
        inputs: [{ name: 'cv', hwPortName: 'cv_in' }],
        outputs: [{ name: 'out', hwPortName: 'out' }],
        args: { frequency: { key: 'freq' } },
      });
    });

    it('defaults missing inputs, outputs and args to empty collections', () => {
      const descriptor = createModuleDescriptor({ type: 'vca', hwModuleId: 1 });

      expect(descriptor).toEqual({
        type: 'vca',
        hwModuleId: 1,
        inputs: [],
        outputs: [],
        args: {},
      });
    });
  });

  describe('validateModuleDescriptor', () => {
    it('returns no errors for a well-formed descriptor', () => {
      const descriptor = createModuleDescriptor({
        type: 'vco',
        hwModuleId: 1056,
        inputs: [{ name: 'cv', hwPortName: 'cv_in' }],
        outputs: [{ name: 'out', hwPortName: 'out' }],
        args: { frequency: { key: 'freq' } },
      });

      expect(validateModuleDescriptor(descriptor)).toEqual([]);
    });

    it('flags a descriptor with duplicate port names', () => {
      const descriptor = createModuleDescriptor({
        type: 'vco',
        hwModuleId: 1056,
        inputs: [
          { name: 'cv', hwPortName: 'cv_in' },
          { name: 'cv', hwPortName: 'cv_in_2' },
        ],
      });

      const errors = validateModuleDescriptor(descriptor);
      expect(errors.some((e) => e.includes('duplicate input'))).toBeTrue();
    });

    it('flags a descriptor with duplicate hardware port names', () => {
      const descriptor = createModuleDescriptor({
        type: 'vco',
        hwModuleId: 1056,
        outputs: [
          { name: 'out1', hwPortName: 'out' },
          { name: 'out2', hwPortName: 'out' },
        ],
      });

      const errors = validateModuleDescriptor(descriptor);
      expect(errors.some((e) => e.includes('duplicate'))).toBeTrue();
    });
  });
});
