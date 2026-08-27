import {
  encodePayload,
} from './wire-protocol';
import {
  USB_VID,
  USB_PID,
  BAUD_RATE,
  EOF_TERMINATOR,
  CHUNK_SIZE,
 } from '../../../../shared/usb-config';

describe('wire-protocol', () => {
  it('exposes the Gooey device USB vendor id', () => {
    expect(USB_VID).toBe(0xcafe);
  });

  it('exposes the Gooey device USB product id', () => {
    expect(USB_PID).toBe(0x4000);
  });

  it('exposes the negotiated baud rate of 115200', () => {
    expect(BAUD_RATE).toBe(115200);
  });

  it('exposes the EOF terminator byte 0x1A', () => {
    expect(EOF_TERMINATOR).toBe(0x1a);
  });

  it('exposes a serial write chunk size of 255 bytes', () => {
    expect(CHUNK_SIZE).toBe(255);
  });

  describe('encodePayload', () => {
    it('encodes the payload as UTF-8 bytes followed by a single 0x1A terminator', () => {
      const payload = '{"modules":[]}';
      const bytes = encodePayload(payload);

      expect(Array.from(bytes)).toEqual([
        ...Array.from(new TextEncoder().encode(payload)),
        0x1a,
      ]);
    });

    it('appends exactly one terminator byte', () => {
      const bytes = encodePayload('abc');
      const terminators = Array.from(bytes).filter((byte) => byte === 0x1a);

      expect(terminators.length).toBe(1);
      expect(bytes[bytes.length - 1]).toBe(0x1a);
    });

    it('encodes an empty payload as just the terminator', () => {
      const bytes = encodePayload('');

      expect(Array.from(bytes)).toEqual([0x1a]);
    });
  });
});
