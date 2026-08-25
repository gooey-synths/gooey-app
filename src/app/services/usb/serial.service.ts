import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { encodePayload } from './wire-protocol';
import {
  USB_VID,
  USB_PID,
  BAUD_RATE,
  CHUNK_SIZE,
} from '../../../../shared/usb-config';

@Injectable({ providedIn: 'root' })
export class SerialService {
  private port: SerialPort | null = null;
  private connected = new BehaviorSubject<boolean>(false);

  connected$ = this.connected.asObservable();

  constructor() {
    const serial = navigator.serial;
    if (serial) {
      serial.addEventListener('disconnect', this.onPortDisconnected);
    }
  }

  isConnected(): boolean {
    return this.connected.value;
  }

  async connect(): Promise<void> {
    if (this.port) {
      return;
    }
    const port = await navigator.serial.requestPort({
      filters: [{ usbVendorId: USB_VID, usbProductId: USB_PID }],
    });
    await port.open({ baudRate: BAUD_RATE });
    this.port = port;
    this.connected.next(true);
  }

  async send(payload: string): Promise<void> {
    const port = this.port;
    if (!port || !port.writable) {
      throw new Error('Serial port is not connected');
    }
    const framed = encodePayload(payload);
    const writer = port.writable.getWriter();
    try {
      for (let offset = 0; offset < framed.length; offset += CHUNK_SIZE) {
        await writer.write(framed.subarray(offset, offset + CHUNK_SIZE));
      }
    } finally {
      writer.releaseLock();
    }
  }

  async disconnect(): Promise<void> {
    const port = this.port;
    if (!port) {
      return;
    }
    this.port = null;
    this.connected.next(false);
    await port.close();
  }

  private onPortDisconnected = (event: SerialPortConnectionEvent): void => {
    if (event.target === this.port) {
      this.port = null;
      this.connected.next(false);
    }
  };
}
