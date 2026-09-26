const { contextBridge, ipcRenderer } = require('electron');

// The channel name is inlined rather than imported from ./ipc-channels: preload
// scripts run sandboxed when contextIsolation is on, and a sandboxed preload
// cannot require relative modules. definitions-folder.test.js asserts this
// string still matches the one main.js registers.
const DEFINITIONS_CHANNEL = 'gooey:read-definitions';

// contextBridge, not nodeIntegration. The renderer gets exactly the one
// function below and no access to fs, path or ipcRenderer itself, so a
// compromised renderer cannot read arbitrary files off disk.
contextBridge.exposeInMainWorld('gooey', {
  readDefinitions: () => ipcRenderer.invoke(DEFINITIONS_CHANNEL),
});
