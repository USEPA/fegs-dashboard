const { app, ipcMain, dialog, BrowserWindow, Menu } = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')

const Util = require('./utils/Util.js')

const isMac = (process.platform === 'darwin')
const isDev = (process.env.node_env && process.env.node_env.trim() === 'dev')
const appTitle = `FEGS Scoping Tool ${app.getVersion()} | BETA | US EPA`
const defaultProjectName = 'New Project'

const controller = {
  saved: true,
  currentProjectName: defaultProjectName,
  currentFilename: null,
  openingFilename: null,
  afterSaved: null,
  quitting: false,

  new() {
    if (!this.saved) {
      switch (this._saveQuery()) {
        case 'yes': return this.save({ and: 'new' })
        case 'no': return this._new()
        case 'cancel': return // do nothing
      }
    } else {
      this._new()
    }
  },
  open() {
    if (this._openDialog()) {
      if (!this.saved) {
        switch (this._saveQuery()) {
          case 'yes': return this.save({ and: 'open' })
          case 'no': return this._open()
          case 'cancel': return // do nothing
        }
      } else {
        this._open()
      }
    }
  },
  save({ and }={}) {
    this.afterSaved = and || null
    if (!this.saved || !this.currentFilename) {
      if (!this.currentFilename) {
        this.saveAs()
      } else {
        this.requestData()
      }
    }
  },
  saveAs() {
    if (this._saveAsDialog()) {
      this.requestData()
    }
  },
  quit(event=null) {
    const cancel = () => (event) ? event.preventDefault() : null
    if (!this.quitting) {
      if (this.saved) {
        if (!isMac) {
          switch (this._quitQuery()) {
            case 'yes': return this._quit()
            case 'no': return cancel()
          }
        } else {
          this._quit()
        }
      } else {
        switch (this._saveQuery()) {
          case 'yes': 
            cancel()
            this.save({ and: 'quit' })
            break
          case 'no': return this._quit()
          case 'cancel': return cancel()
        }
      }
    }
  },
  close() {
    // close all windows but don't quit on macOS
  },

  requestData() {
    mainWindow.send({ action: 'save' })
  },
  writeData(data) { // call with data to save
    try {
      fs.writeFileSync(this.currentFilename, JSON.stringify(data))
      this.currentProjectName = data.project.name
      mainWindow.send({ action: 'saved' })
      this.saved = true
      switch (this.afterSaved) {
        case 'new': this._new(); break
        case 'open': this._open(); break
        case 'quit': this._quit(); break
      }
      this.afterSaved = null // done
    } catch (error) {
      this._error('Unable to save project', error.message)
    }
  },

  _saveQuery() {
    const response = dialog.showMessageBoxSync(mainWindow.ref, { // must be sync
      type: 'question',
      buttons: ['Save', "Don't Save", 'Cancel'],
      title: appTitle,
      message: `Do you want to save your changes to ${this.currentProjectName}?`
    })
    switch (response) {
      case 0: return 'yes' // save
      case 1: return 'no' // don't save
      case 2: return 'cancel'
    }
  },
  _quitQuery() {
    const response = dialog.showMessageBoxSync(mainWindow.ref, { // must be sync
      type: 'question',
      buttons: ['Yes', 'No'],
      title: appTitle,
      message: 'Are you sure you want to quit?'
    });
    switch (response) {
      case 0: return 'yes' // quit
      case 1: return 'no' // don't quit
    }
  },
  _openDialog() {
    const result = dialog.showOpenDialogSync(mainWindow.ref, {
      defaultPath: this.currentFilename || this.currentProjectName,
      properties: ['openFile'],
      filters: [{
        name: 'Custom File Type',
        extensions: ['fegs']
      }]
    })
    if (result) {
      this.openingFilename = result[0]
    }
    return !!result // no result means cancel
  },
  _saveAsDialog() {
    const result = dialog.showSaveDialogSync(mainWindow.ref, {
      defaultPath: this.currentFilename || this.currentProjectName,
      filters: [{
        name: 'Custom File Type',
        extensions: ['fegs']
      }]
    })
    if (result) {
      this.currentFilename = (!result.endsWith('.fegs')) ? `${result}.fegs` : result
    }
    return !!result // no result means cancel
  },

  _new() {
    this.currentFilename = null
    mainWindow.send({ action: 'new' })
  },
  _open() {
    try {
      const data = fs.readFileSync(this.openingFilename)
      this.currentProjectName = Util.deepGet(data, ['project', 'name']) || defaultProjectName
      this.currentFilename = this.openingFilename
      this.openingFilename = null
      mainWindow.send({ action: 'load', data })
    } catch (error) {
      this._error('Unable to open project', error.message)
    }
  },
  _quit() {
    this.quitting = true
    app.quit()
  },
  _close() {
    this.quitting = true
    Object.values(allWindows).forEach(win => win.close())
  },
  _error(msg, detail) {
    dialog.showMessageBox(mainWindow.ref, {
      type: 'error',
      title: appTitle,
      message: msg,
      detail,
    })
  },
}

const mainWindow = { // wrapper for main browser window
  ref: null,
  exists() {
    return (this.ref !== null)
  },
  send(msg) {
    this.ref.webContents.send('msg', msg)
  },
  close() {
    this.ref.close()
  },
  create() {
    this.ref = new BrowserWindow({
      width: 1280,
      height: 1024,
      backgroundColor: '#eee', // enables sub-pixel anti-aliasing
      title: appTitle,
      webPreferences: {
        nodeIntegration: true,
      },
    })
    this.ref.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
      })
    )
    this.ref.webContents.on('did-finish-load', () => {
      this.ref.webContents.openDevTools()
    })
    this.ref.once('ready-to-show', () => {
      this.ref.show()
    })
    this.ref.on('close', event => {
      controller.quit(event)
    })
    this.ref.on('closed', () => {
      this.ref = null
    })

    const menu = Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [
          {
            label: 'New',
            accelerator: `CmdOrCtrl+N`,
            click: () => controller.new(),
          },
          {
            label: 'Open...',
            accelerator: `CmdOrCtrl+O`,
            click: () => controller.open(),
          },
          {
            type: 'separator'
          },
          {
            label: 'Save',
            accelerator: `CmdOrCtrl+S`,
            click: () => controller.save(),
          },
          {
            label: 'Save As... ',
            accelerator: `CmdOrCtrl+Shift+S`,
            click: () => controller.saveAs(),
          },
          {
            type: 'separator'
          },
          {
            label: isMac ? 'Quit' : 'Exit',
            accelerator: isMac ? 'Cmd+Q' : 'Alt+F4',
            click: () => controller.quit(),
          },
        ]
      },
      {
        label: 'About',
        submenu: [
          {
            label: 'Tool Methods',
            click: () => methodsWindow.create()
          }
        ]
      },
      ...(isDev ? [{
        label: 'Toggle DevTools',
        accelerator: 'CmdOrCtrl+I',
        click: () => this.ref.webContents.toggleDevTools(),
      }] : [])
    ])
    Menu.setApplicationMenu(menu)
  },
}

const methodsWindow = {
  ref: null,
  exists() {
    return (this.ref !== null)
  },
  close() {
    this.ref.close()
  },
  create() {
    this.ref = new BrowserWindow({
      parent: mainWindow.ref,
      width: 800,
      height: 600,
      minimizable: false,
      backgroundColor: '#eee', // enables sub-pixel anti-aliasing
      title: `Tool Methods - ${appTitle}`,
    })
    this.ref.setMenu(null)
    this.ref.loadURL(
      url.format({
        pathname: path.join(__dirname, 'about/methods.html'),
        protocol: 'file:',
        slashes: true,
      })
    )
    this.ref.once('ready-to-show', () => {
      this.ref.show()
    })
    this.ref.on('closed', () => {
      this.ref = null
    })
  },
}

const allWindows = { mainWindow, methodsWindow }


ipcMain.on('msg', (event, { action, data }) => {
  console.log(`IPC Action: ${action}`)
  switch (action) {
    case 'save':
      controller.writeData(data)
      break
    case 'unsaved':
      controller.saved = false
      break
    default:
      throw Error(`Unsupported action "${action}"`) // programmer error
  }
})




app.whenReady().then(() => {
  mainWindow.create()
  
  app.on('activate', function () {
    if (!mainWindow.exists()) { // || BrowserWindow.getAllWindows().length === 0) {
      mainWindow.create()
    }
  })

})
