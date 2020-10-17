import { contextBridge, ipcRenderer } from 'electron'

// Provide ipcRenderer functionality (ex: window.ipc.send(...)).
contextBridge.exposeInMainWorld('ipc', {
  send(channel, data) {
    ipcRenderer.send(channel, data)
  },
  on(channel, func) {
    // strip "event" because it includes reference to sender
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  }
})