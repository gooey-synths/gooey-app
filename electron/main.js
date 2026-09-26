const { app, BrowserWindow, autoUpdater, dialog, ipcMain } = require('electron');
const path = require('path');
const { pickConfigPort, matchesUsbId, USB_VID, USB_PID } = require('./serial-ports');
const {
  readDefinitionFiles,
  seedDefinitionsFolder,
  resolveDefinitionsDir,
} = require('./definitions-folder');
const { DEFINITIONS_CHANNEL } = require('./ipc-channels');

let mainWindow;

const isAllowedOrigin = (origin) =>
  origin.startsWith('file://') || origin.startsWith('http://localhost:');

const feedURL = 'https://github.com/gooey-synths/gooey-app/releases/latest/download/update.json';

autoUpdater.setFeedURL({ url: feedURL });

app.whenReady().then(() => {
  const isProd = process.env.NODE_ENV === 'production' || app.isPackaged;

  const { dir: definitionsDir, seed: definitionsSeed } = resolveDefinitionsDir({
    isPackaged: app.isPackaged,
    resourcesPath: process.resourcesPath,
    userDataPath: app.getPath('userData'),
    repoRoot: path.join(__dirname, '..'),
  });

  // Seeded lazily on first read rather than at startup: it is a one-off, and
  // seedDefinitionsFolder is a no-op once the user has their own files there.
  ipcMain.handle(DEFINITIONS_CHANNEL, async () => {
    if (definitionsSeed) {
      try {
        await seedDefinitionsFolder(definitionsDir, definitionsSeed);
      } catch (error) {
        console.error('[definitions] could not seed the definitions folder:', error);
      }
    }
    return readDefinitionFiles(definitionsDir);
  });

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: true
    }
  });

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