const { app, BrowserWindow, autoUpdater, dialog } = require('electron');
const path = require('path');
const { pickConfigPort, matchesUsbId, USB_VID, USB_PID } = require('./serial-ports');

let mainWindow;

const isAllowedOrigin = (origin) =>
  origin.startsWith('file://') || origin.startsWith('http://localhost:');

const feedURL = 'https://github.com/gooey-synths/gooey-app/releases/latest/download/update.json';

autoUpdater.setFeedURL({ url: feedURL });

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      devTools: true
    }
  });

  const isProd = process.env.NODE_ENV === 'production' || app.isPackaged;

  if (isProd) {
    mainWindow.loadURL(`file://${path.join(__dirname, 'dist/gooey-app/browser/index.html')}`);
  } else {
    mainWindow.loadURL('http://localhost:4200');
  }

  const session = mainWindow.webContents.session;

  session.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    if (permission === 'serial') {
      return isAllowedOrigin(requestingOrigin);
    }
    return false;
  });

  session.setDevicePermissionHandler((details) => {
    return (
      details.deviceType === 'serial' &&
      matchesUsbId(details.device?.vendorId, USB_VID) &&
      matchesUsbId(details.device?.productId, USB_PID)
    );
  });

  session.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault();
    const selected = pickConfigPort(portList);
    callback(selected ? selected.portId : '');
  });

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});