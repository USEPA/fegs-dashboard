'use strict'

import { app, protocol, ipcMain } from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

import Util from './classes/Util.js'
import TheController from './classes/TheController.js'
import TheMainMenu from './classes/TheMainMenu.js'
import TheMainWindow from './classes/TheMainWindow.js'
import StaticWindow from './classes/StaticWindow.js'

const isMac = Util.isMac()
const isDev = Util.isDev()
const appTitle = `FEGS Scoping Tool ${app.getVersion()} | BETA | US EPA`
const defaultProjectName = 'New Project'


// Scheme must be registered before the app is ready.
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])


// Wrappers manage each BrowserWindow.
const mainWindow = new TheMainWindow({
  width: 1280,
  height: 1024,
  appTitle,
  devServer: process.env.WEBPACK_DEV_SERVER_URL,
})

const methodsWindow = new StaticWindow({
  width: 900,
  height: 600,
  title: `Tool Methods - ${appTitle}`,
  filename: 'methods.html',
})

const purposeWindow = new StaticWindow({
  width: 600,
  height: 220,
  title: `Tool Purpose - ${appTitle}`,
  filename: 'purpose.html',
})

const windows = {
  mainWindow,
  methodsWindow,
  purposeWindow,
}


// Controller handles menu and IPC actions.
const controller = new TheController({
  windows,
  appTitle,
  defaultProjectName,
})


// Main menu for the app.
const mainMenu = new TheMainMenu({
  windows,
  controller,
})


// Listen for messages from render process.
ipcMain.on('msg', (event, { action, data }) => {
  console.log(`IPC Action: ${action}`)
  switch (action) {
    case 'save':
      controller.writeData(data)
      break
    case 'unsaved':
      controller.unsaved()
      break
    default:
      throw Error(`Unsupported action "${action}"`) // programmer error
  }
})


// Electron initialization finished, ready to create windows.
app.on('ready', async () => {
  if (isDev && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  
  mainMenu.create()
  mainWindow.create()
  controller.new()

  // Only relevant on macOS
  app.on('activate', () => {
    if (!mainWindow.exists()) {
      mainWindow.create()
      controller.new()
    }
  })
})


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (!isMac) app.quit()
})


// Exit cleanly on request from parent process in development mode.
if (isDev) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}