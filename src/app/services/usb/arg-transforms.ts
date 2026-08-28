export type ArgTransform = (value: unknown) => string;

export type TransformRegistry = Record<string, ArgTransform>;

const defaultTransforms: TransformRegistry = {};

export function resolveTransform(
  name: string | undefined,
  registry: TransformRegistry = defaultTransforms,
): ArgTransform {
  if (!name) {
    return (value) => String(value);
  }
  const transform = registry[name];
  if (!transform) {
    throw new Error(`unknown transform: ${name}`);
  }
  return transform;
}
