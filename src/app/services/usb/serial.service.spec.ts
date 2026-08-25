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

function createFakePort(writes: Uint8Array[]): FakePort {
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
    readable: null,
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
    await expectAsync(service.send('data')).toBeRejectedWithError('Serial port is not connected');
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
});
