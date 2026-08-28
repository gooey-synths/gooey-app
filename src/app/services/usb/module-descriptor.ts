export interface ModulePort {
  name: string;
  hwPortName: string;
}

export interface ArgMapping {
  key: string;
  transform?: string;
}

export interface ModuleDescriptor {
  type: string;
  hwModuleId: number;
  inputs: ModulePort[];
  outputs: ModulePort[];
  args: Record<string, ArgMapping>;
}

export interface ModuleDescriptorInput {
  type: string;
  hwModuleId: number;
  inputs?: ModulePort[];
  outputs?: ModulePort[];
  args?: Record<string, ArgMapping>;
}

export function createModuleDescriptor(input: ModuleDescriptorInput): ModuleDescriptor {
  return {
    type: input.type,
    hwModuleId: input.hwModuleId,
    inputs: input.inputs ?? [],
    outputs: input.outputs ?? [],
    args: input.args ?? {},
  };
}

export function validateModuleDescriptor(descriptor: ModuleDescriptor): string[] {
  const errors: string[] = [];

  const inputNames = descriptor.inputs.map((p) => p.name);
  const outputNames = descriptor.outputs.map((p) => p.name);
  const inputHw = descriptor.inputs.map((p) => p.hwPortName);
  const outputHw = descriptor.outputs.map((p) => p.hwPortName);

  if (new Set(inputNames).size !== inputNames.length) {
    errors.push(`duplicate input names for ${descriptor.type}`);
  }
  if (new Set(outputNames).size !== outputNames.length) {
    errors.push(`duplicate output names for ${descriptor.type}`);
  }
  if (new Set(inputHw).size !== inputHw.length) {
    errors.push(`duplicate input hwPortNames for ${descriptor.type}`);
  }
  if (new Set(outputHw).size !== outputHw.length) {
    errors.push(`duplicate output hwPortNames for ${descriptor.type}`);
  }

  return errors;
}
