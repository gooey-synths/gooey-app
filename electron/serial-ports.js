import { USB_VID, USB_PID } from '../shared/usb-config';

function parseUsbId(value) {
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

function matchesUsbId(value, target) {
  return parseUsbId(value).includes(target);
}

function portNumber(name) {
  if (!name) {
    return null;
  }
  const match = name.match(/(\d+)\s*\)?\s*$/);
  return match ? parseInt(match[1], 10) : null;
}

function pickConfigPort(ports) {
  const matching = ports.filter(
    (port) => matchesUsbId(port.vendorId, USB_VID) && matchesUsbId(port.productId, USB_PID),
  );

  if (matching.length === 0) {
    return null;
  }
  if (matching.length === 1) {
    return matching[0];
  }

  const name = (port) => port.displayName || port.portName;

  const numbered = matching.filter((port) => portNumber(name(port)) !== null);
  const unnumbered = matching.filter((port) => portNumber(name(port)) === null);

  numbered.sort((a, b) => (portNumber(name(a)) ?? 0) - (portNumber(name(b)) ?? 0));

  return [...numbered, ...unnumbered][0];
}

module.exports = {
  parseUsbId,
  matchesUsbId,
  portNumber,
  pickConfigPort,
};
