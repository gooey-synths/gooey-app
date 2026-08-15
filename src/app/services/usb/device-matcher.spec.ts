import {
  pickConfigPort,
  portNumber,
  parseUsbId,
  matchesUsbId,
  UsbPortDescriptor,
} from './device-matcher';
import { USB_VID, USB_PID } from './wire-protocol';

const makePort = (overrides: Partial<UsbPortDescriptor> = {}): UsbPortDescriptor => ({
  portId: 'port-1',
  displayName: 'Gooey Device (COM3)',
  vendorId: USB_VID,
  productId: USB_PID,
  ...overrides,
});

describe('parseUsbId', () => {
  it('passes through integer numbers', () => {
    expect(parseUsbId(0xcafe)).toEqual([0xcafe]);
  });

  it('parses a 0x-prefixed hex string', () => {
    expect(parseUsbId('0xcafe')).toEqual([0xcafe]);
  });

  it('parses a bare hex string', () => {
    expect(parseUsbId('cafe')).toEqual([0xcafe]);
  });

  it('includes the decimal interpretation of a digit-only string', () => {
    expect(parseUsbId('51966')).toContain(51966);
  });

  it('returns no candidates for empty or undefined values', () => {
    expect(parseUsbId(undefined)).toEqual([]);
    expect(parseUsbId('')).toEqual([]);
  });

  it('returns no candidates for unparseable values', () => {
    expect(parseUsbId('nope')).toEqual([]);
  });
});

describe('matchesUsbId', () => {
  it('matches numbers', () => {
    expect(matchesUsbId(0xcafe, 0xcafe)).toBeTrue();
    expect(matchesUsbId(0x1234, 0xcafe)).toBeFalse();
  });

  it('matches 0x-prefixed hex strings', () => {
    expect(matchesUsbId('0xcafe', 0xcafe)).toBeTrue();
  });

  it('matches bare hex strings', () => {
    expect(matchesUsbId('cafe', 0xcafe)).toBeTrue();
  });

  it('matches decimal strings', () => {
    expect(matchesUsbId('51966', 0xcafe)).toBeTrue();
  });

  it('matches hex-formatted pure-digit strings (e.g. 0x4000 as "4000")', () => {
    expect(matchesUsbId('4000', 0x4000)).toBeTrue();
  });

  it('does not match unrelated ids', () => {
    expect(matchesUsbId('1234', 0xcafe)).toBeFalse();
  });
});

describe('portNumber', () => {
  it('extracts the trailing port number from a parenthesized display name', () => {
    expect(portNumber('Gooey Device (COM3)')).toBe(3);
  });

  it('extracts the trailing number from a tty path', () => {
    expect(portNumber('/dev/ttyACM0')).toBe(0);
  });

  it('returns null when there is no trailing number', () => {
    expect(portNumber('Gooey Config')).toBeNull();
  });

  it('returns null for an empty name', () => {
    expect(portNumber('')).toBeNull();
  });
});

describe('pickConfigPort', () => {
  it('returns the single matching port', () => {
    const port = makePort({ portId: 'a', displayName: 'Gooey (COM3)' });
    expect(pickConfigPort([port], USB_VID, USB_PID)).toBe(port);
  });

  it('picks the lowest-numbered port among multiple matches (interface 0)', () => {
    const com5 = makePort({ portId: 'high', displayName: 'Gooey Device (COM5)' });
    const com0 = makePort({ portId: 'low', displayName: 'Gooey Device (COM0)' });
    expect(pickConfigPort([com5, com0], USB_VID, USB_PID)).toBe(com0);
  });

  it('ignores ports whose VID/PID do not match', () => {
    const foreign = makePort({ vendorId: 0x1234, productId: 0x5678 });
    expect(pickConfigPort([foreign], USB_VID, USB_PID)).toBeNull();
  });

  it('returns null when no ports match', () => {
    expect(pickConfigPort([], USB_VID, USB_PID)).toBeNull();
  });

  it('handles display names with no trailing number without throwing', () => {
    const unnamed = makePort({ portId: 'a', displayName: 'Gooey Synths' });
    expect(pickConfigPort([unnamed], USB_VID, USB_PID)).toBe(unnamed);
  });

  it('matches string vendor/product ids in 0x-prefixed hex form', () => {
    const port = makePort({ displayName: 'Gooey (COM1)', vendorId: '0xcafe', productId: '0x4000' });
    expect(pickConfigPort([port], USB_VID, USB_PID)).toBe(port);
  });

  it('matches string vendor/product ids in decimal form', () => {
    const port = makePort({ displayName: 'Gooey (COM1)', vendorId: '51966', productId: '16384' });
    expect(pickConfigPort([port], USB_VID, USB_PID)).toBe(port);
  });

  it('matches string vendor/product ids in bare hex form', () => {
    const port = makePort({ displayName: 'Gooey (COM1)', vendorId: 'cafe', productId: '4000' });
    expect(pickConfigPort([port], USB_VID, USB_PID)).toBe(port);
  });

  it('falls back to portName when displayName is absent', () => {
    const port = makePort({ portId: 'a', displayName: '', portName: '/dev/ttyACM1' });
    expect(pickConfigPort([port], USB_VID, USB_PID)).toBe(port);
  });
});
