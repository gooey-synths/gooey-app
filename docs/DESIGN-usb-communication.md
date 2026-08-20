# USB Communication Design Plan

## Final Plan

### 1. Device selection (compound device, 2 serial interfaces, both `0xcafe:0x4000`)
- Renderer: `requestPort({ filters: [{ usbVendorId: 0xcafe, usbProductId: 0x4000 }] })` — returns both ports.
- Electron main: `select-serial-port` auto-accept + `setDevicePermissionHandler` auto-grant for our VID/PID (no picker).
- A `DeviceMatcher` decides *which* of the two ports to open: configured strategy, defaulting to **first matching port**, extensible to match-by-`displayName` substring, with a **user-picker fallback** (`getPorts()` → custom dropdown) if neither auto-strategy reliably hits the config port.
- **Interface 0** = lowest trailing port number (e.g., `ttyACM0`, `COM3` vs `COM5`).

### 2. Wire protocol
- `baudRate: 115200`, no flow control.
- Payload = compact JSON (`JSON.stringify`, zero whitespace) **+ single `0x1A` byte** (^Z EOF terminator).
- Chunked writer honoring backpressure (~255-byte writes per Web Serial's buffering).
- Success = write completion. No ACK/read loop in v1 (read handler hook included for future discovery commands).

### 3. `ModuleDescriptor` schema — `src/app/services/module-descriptor.ts`
```ts
interface ModulePort { name: string; hwPortName: string }

interface ArgMapping {
  key: string;                        // hardware args key
  transform?: string;                 // optional named transform id; default: String(value)
}

interface ModuleDescriptor {
  type: string;                       // app identity, e.g. 'vco'
  hwModuleId: number;                 // numeric module type on device, e.g. 1056
  inputs: ModulePort[];
  outputs: ModulePort[];
  args: Record<string, ArgMapping>;   // config field → { hardware key, optional transform }
}
```
Declarative and JSON-serializable so the future module-JSON refactor can be loaded straight into this shape. Transforms are name-based (`'string'` default; extensible registry later). **Seed descriptors skipped** — the mapper is tested with fixtures instead.

### 4. Adapter (mapper)
- `HardwareConfigMapper.toHardwareConfig(state: FlowchartState, descriptors: ModuleDescriptor[])` → `{ modules, connections }`.
- Assigns module indices in node order; resolves each connection's `start`/`end` port uuids → `(moduleIndex, portName)` via descriptor port lists + the node's `config.inputs`/`config.outputs` maps.
- Validates output (required fields, port names exist) before send; typed errors.

### 5. Services / NgRx / UI
- `SerialService` — connect/disconnect/send + `connected$` RxJS subject.
- `HardwareConfigService` — orchestrates mapper → compact JSON → `send()`.
- New actions/effects (`connectDevice`, `sendToHardware`, +success/failure), minimal status state.
- Toolbar "Send to Hardware" button + connection status dot.

### 6. Tests (Jasmine/Karma)
- Mapper unit tests from descriptor fixtures (index resolution, arg coercion, port mapping, validation).
- `SerialService` with mocked `navigator.serial` (chunked writer, 0x1A append, state transitions).
- Effects with stubbed service.

### 7. Out of scope (v1)
ACK/read loop, discovery queries, device-picker UI (fallback only), seed descriptors, the module-JSON refactor itself.

---

## PR / Branch Split

- **Branch `feat/usb-transport` → PR 1 (firmware guy reviews):** Electron main wiring, `DeviceMatcher`, `SerialService`, wire-protocol constants, + tests. Ends when the connection + transport code is complete → pause and ask about PR creation.
- **Branch `feat/hardware-send` → PR 2 (off updated main after PR 1 merges):** `ModuleDescriptor` types, `HardwareConfigMapper`, `HardwareConfigService`, NgRx actions/effects/reducer, toolbar UI, + tests.

## Workflow (per component)

For each component: **write the failing tests (red) → implement (green) → refactor (green still) → commit** with `(chore):`, `(feat):`, or `(fix):` prefix. Tests are committed together with their component.

## Low-level Designs

### PR 1 — Transport

**1. Wire protocol constants** (`src/app/services/usb/wire-protocol.ts`)
`BAUD_RATE = 115200`, `EOF_TERMINATOR = 0x1A`, `CHUNK_SIZE = 255`, `USB_VID = 0xcafe`, `USB_PID = 0x4000`.
Tests: constants have expected values (documentation-by-test).

**2. `DeviceMatcher`** (`usb/device-matcher.ts`) — pure function
Input: ports with `{ portId, displayName, getInfo() }`. Logic: filter to VID/PID, extract trailing number from `displayName` via `/\d+\s*$/`, sort ascending, return lowest (interface 0). Returns `null` if none.
Tests (red → green):
- picks the single matching port
- among two matching ports, picks the one with the lower trailing port number
- ignores ports whose VID/PID don't match
- handles display names with no trailing number (best-effort, no throw)
- returns `null` when nothing matches

**3. Electron main wiring** (`electron/main.js`, ~20 lines)
- `webContents.session.on('select-serial-port', (event, portList, wc, cb) => { event.preventDefault(); cb([DeviceMatcher.pick(portList)]) })` — passing a single port auto-selects it.
- `ses.setDevicePermissionHandler(...)` auto-granting `deviceType === 'serial'` for our origin.
- Contingency `disable-serial-blocklist` switch.
No Angular tests (plain JS main process) — verified manually + a small Node smoke test if useful.

**4. `SerialService`** (`usb/serial.service.ts`)
API: `connect()` (user gesture required), `disconnect()`, `send(payload: string)`, `connected$: Observable<boolean>`, `ports$`. Internals: `requestPort({ filters })` → `port.open({ baudRate: 115200 })` → chunked `writer.write` (TextEncoder, ≤255-byte chunks, honoring `desiredSize` backpressure, `0x1A` appended to final chunk) → success on completion; `disconnect` releases reader/writer + closes; `navigator.serial` `connect`/`disconnect` events update state.
Tests (mocked `navigator.serial`):
- connect opens port at 115200 and sets `connected$` true
- connect requests with VID/PID filter
- disconnect releases locks, closes port, sets `connected$` false
- send encodes payload, writes in ≤255-byte chunks, awaits each write (backpressure)
- send appends exactly one `0x1A` byte at the end
- send rejects when not connected
- device unplug (`disconnect` event) flips state
- cleanup on destroy

### PR 2 — Adapter + orchestration + UI

**5. `ModuleDescriptor` types** (`module-descriptor.ts`)
As defined above (declarative, JSON-serializable). Tests: type/schema sanity via a fixture factory.

**6. `HardwareConfigMapper`** (`usb/hardware-config.mapper.ts`) — pure
`toHardwareConfig(state, descriptors)` → `{ modules, connections }`. Node order → module index; type → descriptor (error if unknown); port uuids → `(index, portName)` via descriptor port lists; args coerced to strings (named `transform` registry, default `String`). Validates required fields.
Tests (fixture descriptors):
- emits `modules` with hw ids + string args
- coerces number/enum args to strings (default transform)
- applies a named transform when configured
- resolves connection endpoints to correct `(index, portName)`
- unknown node type → typed error
- unknown port uuid → typed error
- output passes schema validation
- module indices follow node order

**7. `HardwareConfigService`** (`usb/hardware-config.service.ts`)
Orchestrates: read state → load descriptors (injectable registry) → `toHardwareConfig` → `JSON.stringify` (compact) → `serialService.send()`.
Tests: happy path (mock mapper + serial service), error propagation, empty patch handling.

**8. NgRx** — actions (`connectDevice`/success/failure, `disconnectDevice`, `deviceDisconnected`, `sendToHardware`/success/failure), `HardwareEffects` (connect, send with `withLatestFrom` nodes/connections, disconnect), reducer state (`deviceStatus`, `sendStatus`, `lastError`).
Tests: effects success/failure paths with stubbed services; reducer transitions.

**9. UI** — toolbar "Connect/Send to Hardware" button + status dot in `app.component`, driven by selectors.
Tests: button dispatches `connectDevice`/`sendToHardware`; status dot reflects state.
