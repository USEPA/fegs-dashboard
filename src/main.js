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
  currentFilepath: null,
  openingFilepath: null,
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
    if (!this.saved || !this.currentFilepath) {
      if (!this.currentFilepath) {
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

  unsaved() {
    this.saved = false
    this._title()
  },
  requestData() {
    mainWindow.send({ action: 'save' })
  },
  writeData(data) { // call with data to save
    try {
      fs.writeFileSync(this.currentFilepath, JSON.stringify(data), 'utf8')
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
      properties: ['openFile'],
      filters: [{
        name: 'Custom File Type',
        extensions: ['fegs']
      }]
    })
    if (result) {
      this.openingFilepath = result[0]
    }
    return !!result // no result means cancel
  },
  _saveAsDialog() {
    const result = dialog.showSaveDialogSync(mainWindow.ref, {
      defaultPath: this.currentFilepath || this.currentProjectName,
      filters: [{
        name: 'Custom File Type',
        extensions: ['fegs']
      }]
    })
    if (result) {
      this.currentFilepath = (!result.endsWith('.fegs')) ? `${result}.fegs` : result
    }
    return !!result // no result means cancel
  },

  _new() {
    this.currentFilepath = null
    this.currentProjectName = defaultProjectName
    mainWindow.send({ action: 'new' })
    this._title()
  },
  _open() {
    try {
      const data = JSON.parse(fs.readFileSync(this.openingFilepath, 'utf8'))
      this.currentProjectName = Util.deepGet(data, ['project', 'name']) || defaultProjectName
      this.currentFilepath = this.openingFilepath
      this.openingFilepath = null
      mainWindow.send({ action: 'load', data })
      this._title()
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
  _title() {
    if (this.currentProjectName) {
      const saveIndicator = (this.saved) ? '' : '*'
      mainWindow.title(`${this.currentProjectName}${saveIndicator} - ${appTitle}`)
    } else {
      mainWindow.title(appTitle)
    }
  }
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
  title(title) {
    this.ref.setTitle(title)
  },
  create() {
    this.ref = new BrowserWindow({
      width: 1280,
      height: 1024,
      backgroundColor: '#FFF', // enables sub-pixel anti-aliasing
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
      if (isDev) this.ref.webContents.openDevTools()
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

    controller.new()

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
            label: 'Tool Purpose',
            click: () => purposeWindow.create(this.ref)
          },
          {
            label: 'Tool Methods',
            click: () => methodsWindow.create(this.ref)
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

class StaticWindow {
  constructor({ width=800, height=600, title, filepath }) {
    this.ref = null
    this.width = width
    this.height = height
    this.title = title
    this.filepath = filepath
  }
  exists() {
    return (this.ref !== null)
  }
  close() {
    this.ref.close()
  }
  create(parent) {
    this.ref = new BrowserWindow({
      parent,
      width: this.width,
      height: this.height,
      minimizable: false,
      backgroundColor: '#FFF', // enables sub-pixel anti-aliasing
      title: this.title,
    })
    this.ref.setMenu(null)
    this.ref.loadURL(
      url.format({
        pathname: path.join(__dirname, this.filepath),
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
  }
}

const methodsWindow = new StaticWindow({
  width: 900,
  height: 600,
  title: `Tool Methods - ${appTitle}`,
  filepath: 'about/methods.html',
})

const purposeWindow = new StaticWindow({
  width: 600,
  height: 220,
  title: `Tool Purpose - ${appTitle}`,
  filepath: 'about/purpose.html',
})


const allWindows = { mainWindow, methodsWindow, purposeWindow }


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


app.whenReady().then(() => {
  mainWindow.create()
  
  app.on('activate', function () {
    if (!mainWindow.exists()) { // || BrowserWindow.getAllWindows().length === 0) {
      mainWindow.create()
    }
  })

})