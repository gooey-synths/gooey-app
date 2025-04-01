const { app, BrowserWindow, autoUpdater, dialog } = require('electron');
// const log = require('electron-log');
const path = require('path');

// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'info';

let mainWindow;

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

  // Check if it's production mode or development mode
  const isProd = process.env.NODE_ENV === 'production' || app.isPackaged;

  if (isProd) {
    // Production mode: Load local build

    // log.info(`file://${path.join(__dirname, 'dist/gooey-app/browser/index.html')}`);
    // mainWindow.loadFile('dist/gooey-app/browser/index.html');
    mainWindow.loadURL(`file://${path.join(__dirname, 'dist/gooey-app/browser/index.html')}`);
  } else {
    // Development mode: Load Angular dev server
    mainWindow.loadURL('http://localhost:4200');
  }

  // if (isProd) {
  //   checkForUpdates();
  // }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
// Function to check for updates
// function checkForUpdates() {
//   log.info('Checking for updates...');
//   autoUpdater.checkForUpdates();
// }

// // Handle auto-updater events
// autoUpdater.on('checking-for-update', () => {
//   log.info('Checking for updates...');
// });

// autoUpdater.on('update-available', (info) => {
//   log.info(`Update available: ${info}`);
// });

// autoUpdater.on('update-not-available', (info) => {
//   log.info('No update available');
// });

// autoUpdater.on('error', (err) => {
//   log.error('Error in auto-updater: ' + err);
// });

// autoUpdater.on('download-progress', (progressObj) => {
//   let log_message = 'Download progress: ';
//   log_message += `speed: ${progressObj.bytesPerSecond} - `;
//   log_message += `percent: ${progressObj.percent} - `;
//   log.info(log_message);
// });

// autoUpdater.on('update-downloaded', (info) => {
//   log.info('Update downloaded. Will install now...');
//   autoUpdater.quitAndInstall();
// });
