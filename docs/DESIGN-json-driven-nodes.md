# Refactor Plan: JSON-Driven Node Definitions

## High-Level Design

**Today:** node types live in code — the sidebar (`node-selector`) hardcodes 3 default `NodeOf` objects, the canvas (`main-canvas`) uses `@if (node.type === 'vco')` chains, and there are 3 bespoke components (`vco`, `envelope`, `vca`) each hand-writing their controls, inputs, and outputs.

**After:** one `nodes.json` file is the single source of truth. A new `NodeDefinitionService` imports it at build time and hands out typed definitions. The sidebar renders one draggable item per JSON entry. A single generic `DynamicNodeComponent` renders any node on the canvas (header + controls + in/out ports) driven purely by its definition. Adding a new node type = add one JSON entry, zero TS/HTML changes.

```
nodes.json ──import──▶ NodeDefinitionService ──┬──▶ node-selector (sidebar, fExternalItem per def)
                                               └──▶ DynamicNodeComponent (renders canvas nodes)
                                                       ▲
                          store (SynthNode, now loosely typed) ─┘
```

**Build-time import** (per your choice): works in both `ng serve` and packaged Electron (`file://` protocol blocks runtime fetch). Requires `resolveJsonModule` in tsconfig.

## Proposed JSON Schema

New file: `src/app/nodes/nodes.json`

```json
{
  "nodes": [
    {
      "type": "vco",
      "label": "VCO",
      "inputs": [
        { "key": "cv", "label": "V/Oct", "connectable": false },
        { "key": "pwm", "label": "PWM", "connectable": false }
      ],
      "outputs": [
        { "key": "out", "label": "OUT", "multiple": true }
      ],
      "controls": [
        {
          "type": "select",
          "key": "waveform",
          "label": "Wave",
          "default": "sine",
          "options": [
            { "value": "sine", "label": "Sine" },
            { "value": "square", "label": "Square" },
            { "value": "saw", "label": "Saw" }
          ]
        },
        {
          "type": "range",
          "key": "frequency",
          "label": "Freq",
          "default": 440,
          "min": 20,
          "max": 2000,
          "step": 1,
          "unit": "Hz"
        },
        {
          "type": "range",
          "key": "pw",
          "label": "PW",
          "default": 0.5,
          "min": 0.05,
          "max": 0.95,
          "step": 0.01
        }
      ]
    },
    {
      "type": "envelope",
      "label": "Envelope (ADSR)",
      "outputs": [{ "key": "out", "label": "OUT", "multiple": true }],
      "controls": [
        { "type": "range", "key": "attack", "label": "Attack", "default": 0.01, "min": 0.001, "max": 2, "step": 0.001, "unit": "s" },
        { "type": "range", "key": "decay", "label": "Decay", "default": 0.1, "min": 0.001, "max": 2, "step": 0.001, "unit": "s" },
        { "type": "range", "key": "sustain", "label": "Sustain", "default": 0.7, "min": 0, "max": 1, "step": 0.01 },
        { "type": "range", "key": "release", "label": "Release", "default": 0.2, "min": 0.001, "max": 5, "step": 0.001, "unit": "s" }
      ]
    },
    {
      "type": "vca",
      "label": "VCA",
      "inputs": [
        { "key": "audio", "label": "Audio Input" },
        { "key": "cv", "label": "CV Input" }
      ],
      "controls": []
    }
  ]
}
```

Notes:
- **VCO inputs** are marked `connectable: false` to mirror today's behavior (they're decorative in `vco.component.html`; VCA's are real `fNodeInput`s). Flip to `true` if you want VCO inputs patchable.
- A node's runtime `config` is derived from the definition: `config[key] = control.default` for each control, plus `config.inputs = {key: uuid}` and `config.outputs = {key: uuid}` per port.

## Multi-Step Plan

**Step 1 — Config & data layer**
- Add `"resolveJsonModule": true` to `tsconfig.json` (JSON import support).
- Create `src/app/nodes/nodes.json` with the schema above.
- Create `src/app/nodes/node-definition.ts` — TypeScript interfaces: `PortDefinition`, `ControlDefinition`, `NodeDefinition`, `NodesFile`. Also a light validation helper.

**Step 2 — `NodeDefinitionService`**
- New `src/app/nodes/node-definition.service.ts`, `providedIn: 'root'`:
  - `imports` the JSON at module scope.
  - `getDefinitions(): NodeDefinition[]`
  - `getDefinition(type: string): NodeDefinition | undefined`
  - `buildConfig(def: NodeDefinition): NodeConfig` — builds fresh config (control defaults + uuid'd input/output maps).

**Step 3 — Loosen store typing** (in `src/app/store/reducers.ts`)
- Replace `NodeConfigMap`, `NodeBase<T>`, `NodeOf<T>` with:
  - `NodeConfig` — `{ [key: string]: unknown; inputs?: Record<string, string>; outputs?: Record<string, string> }`
  - `SynthNode` — `{ id: string; type: string; position: {x,y}; config: NodeConfig }`
  - `NodeType = string`
- Keep `Connection`, `FlowchartState`, `initialState`, and the reducer logic untouched.

**Step 4 — `DynamicNodeComponent`** (new `src/app/dynamic-node/`)
- `@Input() node: SynthNode`; injects `NodeDefinitionService` + `Store`.
- Looks up `definition` by `node.type`; template guards with `@if (definition)` and shows a minimal fallback for unknown/legacy types.
- Header = `definition.label` with `fDragHandle`.
- Controls via `@for` over `definition.controls` with `@switch (control.type)`.
- Inputs via `@for` over `definition.inputs` → `fNodeInput` (skipped when `connectable === false`).
- Outputs via `@for` over `definition.outputs` → `fNodeOutlet` + `fNodeOutput`.
- `update(key: string, value: unknown)` — structured-clone, set, dispatch `updateNode`.

**Step 5 — Rewire the sidebar** (`node-selector`)
- Inject `NodeDefinitionService`; expose `definitions`.
- `@for` over definitions; `[fData]="def"`.

**Step 6 — Rewire the canvas** (`main-canvas`)
- `onDrop`: look up def via `getDefinition(ev.data.type)`; build node with `buildConfig(def)`.
- HTML: replace the `@if` chain with `<app-dynamic-node [node]="node" />`.

**Step 7 — Delete old components**
- Remove `src/app/vco/`, `src/app/envelope/`, `src/app/vca/`.

**Step 8 — Update tests**
- Update `reducer.spec.ts`, `selectors.spec.ts`, `effects.spec.ts`, `main-canvas.component.spec.ts`.
- New `dynamic-node.component.spec.ts`.
- Delete vco/envelope/vca specs.

**Step 9 — Verify**
- `npm run lint`
- `npm test`
- `npm run build`

## Confirm before implementing

1. **VCO inputs connectable?** Plan preserves current behavior (`connectable: false`). Say the word if you want them patchable.
2. **Old component files** get deleted (git history retains them). OK?
3. **File locations:** `src/app/nodes/` (json + types + service) and `src/app/dynamic-node/` — any naming preference?
