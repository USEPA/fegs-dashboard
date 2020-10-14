import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import { BrowserWindow } from 'electron'
import path from 'path'
import url from 'url'

import Util from './Util.js'
import BaseWindow from './BaseWindow.js'

export default class TheMainWindow extends BaseWindow { // wrapper for main browser window
  constructor({ width=1280, height=1024, appTitle, devServer=null }) {
    super({ width, height })
    this.appTitle = appTitle // initial title
    this.devServer = devServer // webpack hot module reloading server
    this.ref = null
  }
  send(msg) {
    this.ref.webContents.send('msg', msg)
  }
  title(title) {
    this.ref.setTitle(title)
  }
  onClose(func) { // closing behavior handled externally
    this.onCloseFunc = func
  }
  create() {
    this.ref = new BrowserWindow({
      width: this.width,
      height: this.height,
      title: this.appTitle,
      backgroundColor: '#FFF', // enables sub-pixel anti-aliasing
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
      },
    })

    if (Util.isDev() && this.devServer) {
      this.ref.loadURL(this.devServer).then(() => {
        this.ref.webContents.openDevTools()
      })
    } else {
      createProtocol('app')
      this.ref.loadURL('app://./index.html')
    }

    this.ref.once('ready-to-show', () => {
      this.ref.show()
    })
    this.ref.on('close', event => {
      Util.safeCall(this.onCloseFunc, event)
    })
    this.ref.on('closed', () => {
      this.ref = null
    })
  }
}