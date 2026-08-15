export const USB_VID = 0xcafe;
export const USB_PID = 0x4000;
export const BAUD_RATE = 115200;
export const EOF_TERMINATOR = 0x1a;
export const CHUNK_SIZE = 255;

export function encodePayload(payload: string): Uint8Array {
  const bytes = new TextEncoder().encode(payload);
  const framed = new Uint8Array(bytes.length + 1);
  framed.set(bytes, 0);
  framed[bytes.length] = EOF_TERMINATOR;
  return framed;
}
