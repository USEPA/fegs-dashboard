const { ipcRenderer } = require('electron')
const Util = require('./utils/Util.js')

const DataStore = require('./store/DataStore.js')
const store = new DataStore()



ipcRenderer.on('action', (event, { action, data }) => {
  switch (action) {
    case 'new':
      store.new()
      break
    case 'load':
      store.load(data)
      break
    case 'save':
      ipcRenderer.send('action', {
        action: 'save',
        data: store.getSaveable()
      })
      break
    default:
      throw Error(`Unknown action "${action}"`) // programmer error
  }
})