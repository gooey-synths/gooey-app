import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { encodePayload } from './wire-protocol';
import {
  USB_VID,
  USB_PID,
  BAUD_RATE,
  CHUNK_SIZE,
  EOF_TERMINATOR,
} from '../../../../shared/usb-config';

const DECODER = new TextDecoder();

@Injectable({ providedIn: 'root' })
export class SerialService {
  private port: SerialPort | null = null;
  private connected = new BehaviorSubject<boolean>(false);
  private received = new Subject<string>();
  private readController: AbortController | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  connected$ = this.connected.asObservable();
  received$ = this.received.asObservable();

  constructor() {
    if (this.isSupported) {
      navigator.serial.addEventListener('disconnect', this.onPortDisconnected);
    }
  }

  get isSupported(): boolean {
    return 'serial' in navigator;
  }

  isConnected(): boolean {
    return this.connected.value;
  }

  async connect(): Promise<void> {
    if (!this.isSupported) {
      console.error('Web Serial API is not supported in this browser.');
      return;
    }

    if (this.port) return;

    try {
      const portToConnect = await navigator.serial.requestPort({
        filters: [{ usbVendorId: USB_VID, usbProductId: USB_PID }],
      });

      await portToConnect.open({ baudRate: BAUD_RATE });

      this.port = portToConnect;
      this.connected.next(true);
      this.readLoop();

    } catch (error) {
      this.connected.next(false);
      this.port = null;
      throw error;
    }
  }

  async send(payload: string): Promise<void> {
    const port = this.port;
    if (!port || !port.writable) {
      throw new Error('Serial port is not connected or not writable');
    }

    const framed = encodePayload(payload);
    const writer = port.writable.getWriter();

    try {
      for (let offset = 0; offset < framed.length; offset += CHUNK_SIZE) {
        await writer.write(framed.subarray(offset, offset + CHUNK_SIZE));
      }
    } catch (error) {
      console.error('Error writing to serial port:', error);
      throw error;
    } finally {
      writer.releaseLock();
    }
  }

  async disconnect(): Promise<void> {
    const port = this.port;
    if (!port) return;

    this.port = null;
    this.connected.next(false);
    await this.stopReading();

    try {
      await port.close();
    } catch (error) {
      console.warn('Error while closing serial port:', error);
    }
  }

  private readLoop(): void {
    const port = this.port;
    if (!port?.readable) {
      return;
    }

    const controller = new AbortController();
    const reader = port.readable.getReader();
    this.readController = controller;
    this.reader = reader;

    const buffer: number[] = [];

    void (async () => {
      try {
        while (!controller.signal.aborted) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          if (!value) {
            continue;
          }
          for (const byte of value) {
            if (byte === EOF_TERMINATOR) {
              this.received.next(DECODER.decode(new Uint8Array(buffer)));
              buffer.length = 0;
            } else {
              buffer.push(byte);
            }
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error reading from serial port:', error);
        }
      } finally {
        if (this.readController === controller) {
          this.readController = null;
        }
        if (this.reader === reader) {
          this.reader = null;
        }
        reader.releaseLock();
      }
    })();
  }

  private async stopReading(): Promise<void> {
    this.readController?.abort();
    this.readController = null;
    const reader = this.reader;
    this.reader = null;
    if (reader) {
      try {
        await reader.cancel();
      } catch {
        // no-op
      }
    }
  }

  private onPortDisconnected = (event: SerialPortConnectionEvent): void => {
    if (event.target === this.port) {
      this.port = null;
      this.connected.next(false);
    }
  };
}
