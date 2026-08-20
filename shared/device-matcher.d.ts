export interface UsbPortDescriptor {
  portId: string;
  portName?: string;
  displayName?: string;
  vendorId?: number | string;
  productId?: number | string;
}

export function parseUsbId(value: number | string | undefined): number[];
export function matchesUsbId(value: number | string | undefined, target: number): boolean;
export function portNumber(name?: string): number | null;
export function pickConfigPort(
  ports: UsbPortDescriptor[],
  vid?: number,
  pid?: number,
): UsbPortDescriptor | null;
