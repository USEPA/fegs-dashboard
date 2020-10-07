const { ipcRenderer } = require('electron')
const Util = require('./utils/Util.js')

const DataStore = require('./store/DataStore.js')
const store = new DataStore()
store.onModified(() => {
  ipcRenderer.send('msg', { action: 'unsaved' })
})


ipcRenderer.on('msg', (event, { action, data }) => {
  console.log(`IPC Action: ${action}`)
  switch (action) {
    case 'new':
      store.new()
      store.setProjectName('wink')
      break
    case 'load':
      try {
        store.load(data)
      } catch (error) {
        console.error(`Error loading file: ${error.message}`)
      }
      break
    case 'save':
      ipcRenderer.send('msg', {
        action: 'save',
        data: store.getSaveable()
      })
      break
    case 'saved':
      store.modified = false
      break
    default:
      throw Error(`Unknown action "${action}"`) // programmer error
  }
})

const test = document.getElementById('test')
let flag = true
window.setInterval(() => {
  test.style.backgroundColor = (flag) ? 'yellow' : 'red'
  flag = !flag
}, 1000)