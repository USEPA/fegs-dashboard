const {app, ipcMain, dialog, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

const windows = {} // maintain references

const state = {}

function createMainWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 1024,
    backgroundColor: '#fff', // enables sub-pixel anti-aliasing
    webPreferences: {
      nodeIntegration: true,
    },
    title: '---- My Title ----',
  })

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true,
    })
  )

  win.webContents.on('did-finish-load', () => {
    win.webContents.openDevTools()

  })
  
  return win
}



ipcMain.on('action', (event, { action, data }) => {
  switch (action) {
    case 'save':
      // save data to file
      break
    default:
      throw Error(`Unsupported action "${action}"`) // programmer error
  }
})

ipcMain.on('state', (event, states) => {
  Object.entries(states).forEach(([key, val]) => {
    state[key] = val
  }) // TODO too vague... think clearly on monday :)
})




app.whenReady().then(() => {
  windows.main = createMainWindow()
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      windows.main = createMainWindow()
    }
  })

})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit() // macOS quits with Cmd + Q
})
