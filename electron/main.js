const { app, BrowserWindow, autoUpdater, dialog } = require('electron');
const path = require('path');

let mainWindow;

const feedURL = 'https://github.com/gooey-synths/gooey-app/releases/latest';

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

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});