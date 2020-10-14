import { contextBridge, ipcRenderer } from 'electron'

// Secure wrapper for ipcRenderer, no node modules in render process.
contextBridge.exposeInMainWorld('ipc', {
  send(channel, data) {
    ipcRenderer.send(channel, data)
  },
  on(channel, func) {
    // strip "event" because it includes reference to sender
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  }
})