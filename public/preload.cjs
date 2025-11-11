const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('store', {
  get(key) {
    return ipcRenderer.invoke('store:get', key);
  },
  set(key, value) {
    return ipcRenderer.invoke('store:set', { key, value });
  },
  delete(key) {
    return ipcRenderer.invoke('store:delete', key);
  },
  clear() {
    return ipcRenderer.invoke('store:clear');
  }
});
