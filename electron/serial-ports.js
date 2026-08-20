const { USB_VID, USB_PID } = require('../shared/usb-config');
const { parseUsbId, matchesUsbId, portNumber, pickConfigPort } = require('../shared/device-matcher');

module.exports = {
  USB_VID,
  USB_PID,
  parseUsbId,
  matchesUsbId,
  portNumber,
  pickConfigPort,
};
