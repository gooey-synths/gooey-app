import { EOF_TERMINATOR } from '../../../../shared/usb-config';

export function encodePayload(payload: string): Uint8Array {
  const bytes = new TextEncoder().encode(payload);
  const framed = new Uint8Array(bytes.length + 1);
  framed.set(bytes, 0);
  framed[bytes.length] = EOF_TERMINATOR;
  return framed;
}
