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
      let portToConnect: SerialPort | undefined;

      // 1. Try to find a previously approved port to skip the prompt
      const existingPorts = await navigator.serial.getPorts();
      portToConnect = existingPorts.find((p) => {
        const info = p.getInfo();
        return info.usbVendorId === USB_VID && info.usbProductId === USB_PID;
      });

      // 2. If no previously approved port, prompt the user
      if (!portToConnect) {
        portToConnect = await navigator.serial.requestPort({
          filters: [{ usbVendorId: USB_VID, usbProductId: USB_PID }],
        });
      }

      await portToConnect.open({ baudRate: BAUD_RATE });

      this.port = portToConnect;
      this.connected.next(true);

    } catch (error) {
      // Handles DOMException when user cancels the port picker (or a real failure).
      // Re-throw so callers (effects) can react: a cancel must NOT mark us connected.
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
      // Ensure lock is ALWAYS released, even if a chunk write fails (e.g. cable pulled)
      writer.releaseLock();
    }
  }

  async disconnect(): Promise<void> {
    const port = this.port;
    if (!port) return;

    // Eagerly update UI state
    this.port = null;
    this.connected.next(false);

    try {
      await port.close();
    } catch (error) {
      // This catches errors if the port is closed while a stream lock is still active
      console.warn('Error while closing serial port:', error);
    }
  }

  private onPortDisconnected = (event: SerialPortConnectionEvent): void => {
    if (event.target === this.port) {
      this.port = null;
      this.connected.next(false);
    }
  };
}
