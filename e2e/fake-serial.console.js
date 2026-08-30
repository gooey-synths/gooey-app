/*
 * Dev-only fake for `navigator.serial` so you can exercise Connect/Send
 * in the UI without a physical Gooey device.
 *
 * Usage:
 *   1. Run `npm start` and open http://localhost:4200 (or the Electron window).
 *   2. Open the DevTools console.
 *   3. Paste the *contents* of this file (or the whole `installFakeSerial()` call).
 *
 * It injects a device matching VID/PID 0xcafe:0x4002, so Electron's auto-select
 * and the app's "previously approved port" path both work. Any bytes the app
 * writes (chunked, with the 0x1A EOF terminator) are captured and printed via
 * window.__fakeSerialWrites.
 */
(function installFakeSerial() {
  // Chromium exposes a real `navigator.serial` getter, so don't bail if it exists —
  // force-replace it so the app talks to our fake instead of the real picker.
  // Bytes the app writes via `SerialService.send` accumulate here.
  const writes = [];

  const fakePort = {
    open: async () => {
      console.log('[fake-serial] port.open() called (baud 115200)');
    },
    close: async () => {
      console.log('[fake-serial] port.close() called');
    },
    getInfo: () => ({ usbVendorId: 0xcafe, usbProductId: 0x4002 }),
    writable: new WritableStream({
      write(chunk) {
        const bytes = new Uint8Array(chunk);
        writes.push(bytes);
        const text = new TextDecoder().decode(bytes);
        console.log('[fake-serial] wrote', bytes.length, 'bytes:', JSON.stringify(text));
      },
    }),
    readable: null,
  };

  const fakeSerial = {
    getPorts: async () => [fakePort], // a previously-approved device, skips the picker
    requestPort: async () => fakePort,
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  Object.defineProperty(navigator, 'serial', {
    value: fakeSerial,
    configurable: true,
  });

  window.__fakeSerialWrites = writes;
  window.__fakeSerialPort = fakePort;

  console.log(
    '[fake-serial] installed. Collect your module args here: JSON.stringify(window.__fakeSerialWrites)',
  );
})();
