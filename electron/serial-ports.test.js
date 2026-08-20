const test = require('node:test');
const assert = require('node:assert/strict');

const { USB_VID, USB_PID } = require('../shared/usb-config');
const { parseUsbId, matchesUsbId, portNumber, pickConfigPort } = require('../shared/device-matcher');

const makePort = (overrides = {}) => ({
  portId: 'port-1',
  displayName: 'Gooey Device (COM3)',
  vendorId: USB_VID,
  productId: USB_PID,
  ...overrides,
});

test('exposes the Gooey device ids', () => {
  assert.equal(USB_VID, 0xcafe);
  assert.equal(USB_PID, 0x4000);
});

test('parseUsbId handles numbers, hex and decimal strings', () => {
  assert.deepEqual(parseUsbId(0xcafe), [0xcafe]);
  assert.deepEqual(parseUsbId('0xcafe'), [0xcafe]);
  assert.deepEqual(parseUsbId('cafe'), [0xcafe]);
  assert.deepEqual(parseUsbId('51966'), [51966, 334182]);
  assert.deepEqual(parseUsbId(undefined), []);
  assert.deepEqual(parseUsbId('nope'), []);
});

test('matchesUsbId matches our device ids in any common format', () => {
  assert.equal(matchesUsbId(0xcafe, USB_VID), true);
  assert.equal(matchesUsbId('0xcafe', USB_VID), true);
  assert.equal(matchesUsbId('cafe', USB_VID), true);
  assert.equal(matchesUsbId('51966', USB_VID), true);
  assert.equal(matchesUsbId('4000', USB_PID), true);
  assert.equal(matchesUsbId('1234', USB_VID), false);
});

test('portNumber extracts trailing port numbers', () => {
  assert.equal(portNumber('Gooey Device (COM3)'), 3);
  assert.equal(portNumber('/dev/ttyACM0'), 0);
  assert.equal(portNumber('Gooey Config'), null);
  assert.equal(portNumber(''), null);
});

test('pickConfigPort returns the single matching port', () => {
  const port = makePort({ portId: 'a', displayName: 'Gooey (COM3)' });
  assert.equal(pickConfigPort([port]), port);
});

test('pickConfigPort picks the lowest-numbered port (interface 0)', () => {
  const com5 = makePort({ portId: 'high', displayName: 'Gooey Device (COM5)' });
  const com0 = makePort({ portId: 'low', displayName: 'Gooey Device (COM0)' });
  assert.equal(pickConfigPort([com5, com0]), com0);
});

test('pickConfigPort ignores ports that do not match the device ids', () => {
  const foreign = makePort({ vendorId: 0x1234, productId: 0x5678 });
  assert.equal(pickConfigPort([foreign]), null);
});

test('pickConfigPort returns null when nothing matches', () => {
  assert.equal(pickConfigPort([]), null);
});

test('pickConfigPort handles names with no trailing number without throwing', () => {
  const unnamed = makePort({ portId: 'a', displayName: 'Gooey Synths' });
  assert.equal(pickConfigPort([unnamed]), unnamed);
});

test('pickConfigPort matches decimal and bare-hex string ids', () => {
  const decimal = makePort({ displayName: 'Gooey (COM1)', vendorId: '51966', productId: '16384' });
  const bareHex = makePort({ displayName: 'Gooey (COM1)', vendorId: 'cafe', productId: '4000' });
  assert.equal(pickConfigPort([decimal]), decimal);
  assert.equal(pickConfigPort([bareHex]), bareHex);
});

test('pickConfigPort falls back to portName when displayName is absent', () => {
  const port = makePort({ portId: 'a', displayName: '', portName: '/dev/ttyACM1' });
  assert.equal(pickConfigPort([port]), port);
});
