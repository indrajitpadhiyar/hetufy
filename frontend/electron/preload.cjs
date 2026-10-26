const { contextBridge, ipcRenderer } = require('electron');

/**
 * Secure Preload Script
 * 
 * Enforces strict context isolation and exposes only safe, minimal IPC methods
 * for window controls and platform metadata.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,

  // Window Controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // Safe external link opening
  openExternal: (url) => {
    if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
      ipcRenderer.send('open-external', url);
    }
  }
});
