// How a node maps onto a hardware module. Values are not invented: they come
// from the payload that HardwareConfigService already sends and the firmware
// already accepts. fast_analog_out is id 1 and names its instances ao0, ao1...
export interface HardwareMetadata {
  id: number;
  namePrefix: string;
}

export interface PortDefinition {
  key: string;
  label: string;
  connectable?: boolean;
  multiple?: boolean;
  // Port name the firmware expects. Falls back to `key` when absent.
  hwPortName?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface RangeControl {
  type: 'range';
  key: string;
  label: string;
  default: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

export interface SelectControl {
  type: 'select';
  key: string;
  label: string;
  default: string;
  options: SelectOption[];
}

export type ControlDefinition = RangeControl | SelectControl;

export interface NodeDefinition {
  type: string;
  label: string;
  // Absent for nodes that are purely a UI concern and map to no module.
  hw?: HardwareMetadata;
  inputs?: PortDefinition[];
  outputs?: PortDefinition[];
  controls?: ControlDefinition[];
}

export interface NodesFile {
  nodes: NodeDefinition[];
}

export interface ValidationError {
  node: string;
  message: string;
}

export function validateNodes(file: NodesFile): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenTypes = new Set<string>();

  for (const def of file.nodes) {
    const scope = def.type ?? '(unknown)';

    if (!def.type) {
      errors.push({ node: scope, message: 'node is missing a type' });
    }

    if (!def.label) {
      errors.push({ node: scope, message: 'node is missing a label' });
    }

    if (def.type && seenTypes.has(def.type)) {
      errors.push({ node: def.type, message: 'duplicate node type' });
    }
    if (def.type) {
      seenTypes.add(def.type);
    }

    if (def.hw) {
      if (typeof def.hw.id !== 'number') {
        errors.push({ node: scope, message: 'hw.id must be a number' });
      }
      if (!def.hw.namePrefix) {
        errors.push({ node: scope, message: 'hw.namePrefix must not be empty' });
      }
    }

    const seenInputs = new Set<string>();
    for (const input of def.inputs ?? []) {
      if (seenInputs.has(input.key)) {
        errors.push({ node: scope, message: `duplicate input key '${input.key}'` });
      }
      seenInputs.add(input.key);
    }

    const seenOutputs = new Set<string>();
    for (const output of def.outputs ?? []) {
      if (seenOutputs.has(output.key)) {
        errors.push({ node: scope, message: `duplicate output key '${output.key}'` });
      }
      seenOutputs.add(output.key);
    }

    const seenControls = new Set<string>();
    for (const control of def.controls ?? []) {
      if (seenControls.has(control.key)) {
        errors.push({ node: scope, message: `duplicate control key '${control.key}'` });
      }
      seenControls.add(control.key);

      if (control.type === 'range') {
        if (control.min === undefined) {
          errors.push({ node: scope, message: `range control '${control.key}' is missing min` });
        }
        if (control.max === undefined) {
          errors.push({ node: scope, message: `range control '${control.key}' is missing max` });
        }
        if (control.step === undefined) {
          errors.push({ node: scope, message: `range control '${control.key}' is missing step` });
        }
      } else if (control.type === 'select') {
        if (!control.options || control.options.length === 0) {
          errors.push({ node: scope, message: `select control '${control.key}' must have options` });
        }
      } else {
        errors.push({ node: scope, message: `unknown control type '${(control as { type: string }).type}'` });
      }
    }
  }

  return errors;
}

export interface RawDefinition {
  file: string;
  json: unknown;
}

export interface DefinitionLoadError {
  file: string;
  node: string;
  message: string;
}

export interface LoadedDefinitions {
  definitions: NodeDefinition[];
  errors: DefinitionLoadError[];
}

export function loadDefinitions(files: RawDefinition[]): LoadedDefinitions {
  const definitions: NodeDefinition[] = [];
  const errors: DefinitionLoadError[] = [];
  const claimedBy = new Map<string, string>();

  for (const { file, json } of files) {
    if (typeof json !== 'object' || json === null || Array.isArray(json)) {
      errors.push({ file, node: file, message: 'file does not contain a JSON object' });
      continue;
    }

    const fileErrors = validateNodes({ nodes: [json as NodeDefinition] });
    if (fileErrors.length > 0) {
      errors.push(...fileErrors.map(error => ({ file, ...error })));
      continue;
    }

    const type = (json as NodeDefinition).type;
    const claimant = claimedBy.get(type);
    if (claimant !== undefined) {
      errors.push({
        file,
        node: type,
        message: `duplicate node type '${type}', already defined by ${claimant}`,
      });
      continue;
    }
    claimedBy.set(type, file);

    definitions.push(json as NodeDefinition);
  }

  return { definitions, errors };
}
