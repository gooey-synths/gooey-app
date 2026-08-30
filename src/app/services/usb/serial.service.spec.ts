import { TestBed } from '@angular/core/testing';
import { SerialService } from './serial.service';
import { encodePayload } from './wire-protocol';
import {
  USB_VID,
  USB_PID,
  BAUD_RATE,
  CHUNK_SIZE,
} from '../../../../shared/usb-config';

interface FakePort {
  open: jasmine.Spy;
  close: jasmine.Spy;
  getInfo: jasmine.Spy;
  writable: WritableStream<Uint8Array>;
  readable: ReadableStream<Uint8Array> | null;
}

function createFakePort(
  writes: Uint8Array[],
  readable: ReadableStream<Uint8Array> | null = null,
): FakePort {
  const writable = new WritableStream<Uint8Array>({
    write(chunk) {
      writes.push(new Uint8Array(chunk));
    },
  });
  return {
    open: jasmine.createSpy('open').and.resolveTo(),
    close: jasmine.createSpy('close').and.resolveTo(),
    getInfo: jasmine
      .createSpy('getInfo')
      .and.returnValue({ usbVendorId: USB_VID, usbProductId: USB_PID }),
    writable,
    readable,
  };
}

class FakeSerial {
  requestPort: jasmine.Spy = jasmine.createSpy('requestPort');
  getPorts: jasmine.Spy = jasmine.createSpy('getPorts').and.resolveTo([]);
  private listeners = new Map<string, ((event: unknown) => void)[]>();

  addEventListener(type: string, listener: (event: unknown) => void): void {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: (event: unknown) => void): void {
    const listeners = this.listeners.get(type) ?? [];
    this.listeners.set(type, listeners.filter((l) => l !== listener));
  }

  emit(type: 'connect' | 'disconnect', target: unknown): void {
    for (const listener of this.listeners.get(type) ?? []) {
      listener({ target });
    }
  }
}

describe('SerialService', () => {
  let service: SerialService;
  let fakeSerial: FakeSerial;
  let writes: Uint8Array[];
  let port: FakePort;

  beforeEach(() => {
    writes = [];
    port = createFakePort(writes);
    fakeSerial = new FakeSerial();
    fakeSerial.requestPort.and.resolveTo(port);
    Object.defineProperty(navigator, 'serial', { value: fakeSerial, configurable: true });
    TestBed.configureTestingModule({});
    service = TestBed.inject(SerialService);
  });

  afterEach(() => {
    delete (navigator as unknown as Record<string, unknown>)['serial'];
  });

  it('reports disconnected initially', () => {
    expect(service.isConnected()).toBe(false);
    const values: boolean[] = [];
    service.connected$.subscribe((value) => values.push(value));
    expect(values).toEqual([false]);
  });

  it('connects with the Gooey device filters and baud rate', async () => {
    await service.connect();
    expect(fakeSerial.requestPort).toHaveBeenCalledWith({
      filters: [{ usbVendorId: USB_VID, usbProductId: USB_PID }],
    });
    expect(port.open).toHaveBeenCalledWith({ baudRate: BAUD_RATE });
    expect(service.isConnected()).toBe(true);
  });

  it('does not request the port twice when already connected', async () => {
    await service.connect();
    await service.connect();
    expect(fakeSerial.requestPort).toHaveBeenCalledTimes(1);
    expect(port.open).toHaveBeenCalledTimes(1);
  });

  it('always shows the picker even when a previously granted device exists', async () => {
    fakeSerial.getPorts.and.resolveTo([port]);

    await service.connect();

    expect(fakeSerial.requestPort).toHaveBeenCalled();
    expect(fakeSerial.getPorts).not.toHaveBeenCalled();
    expect(service.isConnected()).toBe(true);
  });

  it('rejects and stays disconnected when the port picker is canceled', async () => {
    fakeSerial.requestPort.and.rejectWith(new DOMException('User canceled the request', 'NotFoundError'));

    await expectAsync(service.connect()).toBeRejected();
    expect(service.isConnected()).toBe(false);
  });

  it('sends the framed payload over the port', async () => {
    await service.connect();
    await service.send('{"modules":[]}');
    expect(writes.length).toBe(1);
    expect(writes[0]).toEqual(encodePayload('{"modules":[]}'));
  });

  it('chunks large payloads into CHUNK_SIZE byte writes', async () => {
    const payload = 'x'.repeat(CHUNK_SIZE * 3 + 50);
    const framed = encodePayload(payload);
    await service.connect();
    await service.send(payload);
    expect(writes.length).toBeGreaterThan(1);
    for (const chunk of writes) {
      expect(chunk.length).toBeLessThanOrEqual(CHUNK_SIZE);
    }
    const joined = new Uint8Array(writes.reduce((total, chunk) => total + chunk.length, 0));
    let offset = 0;
    for (const chunk of writes) {
      joined.set(chunk, offset);
      offset += chunk.length;
    }
    expect(joined).toEqual(framed);
    expect(framed.length).toBeGreaterThan(CHUNK_SIZE);
  });

  it('rejects send when not connected', async () => {
    await expectAsync(service.send('data')).toBeRejectedWithError('Serial port is not connected or not writable');
    expect(writes.length).toBe(0);
  });

  it('disconnects by closing the port', async () => {
    await service.connect();
    await service.disconnect();
    expect(port.close).toHaveBeenCalledTimes(1);
    expect(service.isConnected()).toBe(false);
  });

  it('disconnect without a connection is a no-op', async () => {
    await service.disconnect();
    expect(port.close).not.toHaveBeenCalled();
  });

  it('marks the service disconnected when the device is unplugged', async () => {
    await service.connect();
    fakeSerial.emit('disconnect', port);
    expect(service.isConnected()).toBe(false);
  });

  it('emits deviceDisconnected when the device is unplugged', async () => {
    await service.connect();

    let unplugged = false;
    service.deviceDisconnected$.subscribe(() => (unplugged = true));

    fakeSerial.emit('disconnect', port);
    expect(unplugged).toBe(true);
  });

  it('does not emit deviceDisconnected on an explicit disconnect', async () => {
    await service.connect();

    let unplugged = false;
    service.deviceDisconnected$.subscribe(() => (unplugged = true));

    await service.disconnect();
    expect(unplugged).toBe(false);
  });

  it('cancels the read stream when the device is unplugged', async () => {
    let cancelled = false;
    const readable = new ReadableStream<Uint8Array>({
      cancel() {
        cancelled = true;
      },
    });
    port = createFakePort(writes, readable);
    fakeSerial.requestPort.and.resolveTo(port);

    await service.connect();
    fakeSerial.emit('disconnect', port);
    await new Promise((resolve) => setTimeout(resolve));

    expect(cancelled).toBe(true);
  });

  it('ignores disconnect events for other ports', async () => {
    await service.connect();
    fakeSerial.emit('disconnect', createFakePort([]));
    expect(service.isConnected()).toBe(true);
  });

  it('emits connection state changes', async () => {
    const values: boolean[] = [];
    service.connected$.subscribe((value) => values.push(value));
    await service.connect();
    await service.disconnect();
    expect(values).toEqual([false, true, false]);
  });

  it('buffers incoming bytes and emits a message only at the EOF terminator', async () => {
    let enqueue!: (chunk: Uint8Array) => void;
    const readable = new ReadableStream<Uint8Array>({
      start(controller) {
        enqueue = (chunk) => controller.enqueue(chunk);
      },
    });
    port = createFakePort(writes, readable);
    fakeSerial.requestPort.and.resolveTo(port);

    await service.connect();

    const framed = encodePayload('{"ok":true}');
    const received: string[] = [];
    service.received$.subscribe((text) => received.push(text));

    enqueue(framed.subarray(0, framed.length - 1));
    await new Promise((resolve) => setTimeout(resolve));
    expect(received).toEqual([]);

    enqueue(framed.subarray(framed.length - 1));
    await new Promise((resolve) => setTimeout(resolve));
    expect(received).toEqual(['{"ok":true}']);
  });

  it('emits one message per frame, even when multiple frames arrive in a chunk', async () => {
    let enqueue!: (chunk: Uint8Array) => void;
    const readable = new ReadableStream<Uint8Array>({
      start(controller) {
        enqueue = (chunk) => controller.enqueue(chunk);
      },
    });
    port = createFakePort(writes, readable);
    fakeSerial.requestPort.and.resolveTo(port);

    await service.connect();

    const frames = new Uint8Array([
      ...encodePayload('first'),
      ...encodePayload('second'),
    ]);

    const received: string[] = [];
    service.received$.subscribe((text) => received.push(text));

    enqueue(frames);
    await new Promise((resolve) => setTimeout(resolve));

    expect(received).toEqual(['first', 'second']);
  });

  it('stops the read loop on disconnect', async () => {
    const readable = new ReadableStream<Uint8Array>();
    port = createFakePort(writes, readable);
    fakeSerial.requestPort.and.resolveTo(port);

    await service.connect();
    await service.disconnect();

    expect(port.close).toHaveBeenCalledTimes(1);
  });
});
