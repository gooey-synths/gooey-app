interface SerialPortInfo {
  usbVendorId: number;
  usbProductId: number;
}

interface SerialPortOpenOptions {
  baudRate: number;
  bufferSize?: number;
}

interface SerialPort {
  open(options: SerialPortOpenOptions): Promise<void>;
  close(): Promise<void>;
  readonly readable: ReadableStream<Uint8Array> | null;
  readonly writable: WritableStream<Uint8Array> | null;
  getInfo(): SerialPortInfo;
}

interface SerialRequestPortFilter {
  usbVendorId: number;
  usbProductId: number;
}

interface SerialRequestPortOptions {
  filters?: SerialRequestPortFilter[];
}

interface SerialPortConnectionEvent extends Event {
  target: SerialPort;
}

interface Serial {
  requestPort(options?: SerialRequestPortOptions): Promise<SerialPort>;
  getPorts(): Promise<SerialPort[]>;
  addEventListener(type: 'connect' | 'disconnect', listener: (event: SerialPortConnectionEvent) => void): void;
  removeEventListener(type: 'connect' | 'disconnect', listener: (event: SerialPortConnectionEvent) => void): void;
}

interface Navigator {
  readonly serial: Serial;
}
