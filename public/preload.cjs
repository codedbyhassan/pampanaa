const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  app: {
    getVersion: () => ipcRenderer.invoke('get-app-version'),
    getPath: (name) => ipcRenderer.invoke('get-app-path', name),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window-minimize'),
    toggleMaximize: () => ipcRenderer.invoke('window-toggle-maximize'),
    close: () => ipcRenderer.invoke('window-close'),
  },
  dialog: {
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  },
  platform: process.platform,
  arch: process.arch,
});
