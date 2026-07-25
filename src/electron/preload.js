const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setApplicationMenu: template => ipcRenderer.send('set-application-menu', template),
  onMenuItemClick: callback =>
    ipcRenderer.on('menu-item-click', (_event, id) => callback(id))
});
