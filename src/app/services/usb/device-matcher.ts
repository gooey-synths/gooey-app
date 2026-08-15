import { USB_VID, USB_PID } from './wire-protocol';

export interface UsbPortDescriptor {
  portId: string;
  portName?: string;
  displayName?: string;
  vendorId?: number | string;
  productId?: number | string;
}

export function parseUsbId(value: number | string | undefined): number[] {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? [value] : [];
  }
  if (typeof value !== 'string' || value.trim() === '') {
    return [];
  }

  const str = value.trim();

  if (/^0[xX]/.test(str)) {
    const hex = parseInt(str, 16);
    return Number.isNaN(hex) ? [] : [hex];
  }

  if (/^[0-9]+$/.test(str)) {
    const candidates = [parseInt(str, 10)];
    const asHex = parseInt(str, 16);
    if (!Number.isNaN(asHex) && asHex !== candidates[0]) {
      candidates.push(asHex);
    }
    return candidates;
  }

  if (/^[0-9a-fA-F]+$/.test(str)) {
    const hex = parseInt(str, 16);
    return Number.isNaN(hex) ? [] : [hex];
  }

  return [];
}

export function matchesUsbId(value: number | string | undefined, target: number): boolean {
  return parseUsbId(value).includes(target);
}

export function portNumber(name?: string): number | null {
  if (!name) {
    return null;
  }
  const match = name.match(/(\d+)\s*\)?\s*$/);
  return match ? parseInt(match[1], 10) : null;
}

export function pickConfigPort(
  ports: UsbPortDescriptor[],
  vid = USB_VID,
  pid = USB_PID,
): UsbPortDescriptor | null {
  const matching = ports.filter(
    (port) => matchesUsbId(port.vendorId, vid) && matchesUsbId(port.productId, pid),
  );

  if (matching.length === 0) {
    return null;
  }
  if (matching.length === 1) {
    return matching[0];
  }

  const name = (port: UsbPortDescriptor) => port.displayName || port.portName;

  const numbered = matching.filter((port) => portNumber(name(port)) !== null);
  const unnumbered = matching.filter((port) => portNumber(name(port)) === null);

  numbered.sort((a, b) => (portNumber(name(a)) ?? 0) - (portNumber(name(b)) ?? 0));

  return [...numbered, ...unnumbered][0];
}
