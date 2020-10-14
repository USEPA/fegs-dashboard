import { app, protocol, ipcMain, dialog, BrowserWindow, Menu } from 'electron'
import fs from 'fs'

import Util from './Util.js'

export default class TheController {
  constructor({ windows, appTitle, defaultProjectName }) {
    this.windows = windows
    this.mainWindow = windows.mainWindow
    this.appTitle = appTitle
    this.defaultProjectName = defaultProjectName
    this.currentProjectName = defaultProjectName

    this.saved = true
    this.currentFilepath = null
    this.openingFilepath = null
    this.afterSaved = null
    this.quitting = false

    this.mainWindow.onClose(event => {
      this.quit(event) // event may be cancelled
    })
  }

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
  }
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
  }
  save({ and }={}) {
    this.afterSaved = and || null
    if (!this.saved || !this.currentFilepath) {
      if (!this.currentFilepath) {
        this.saveAs()
      } else {
        this.requestData()
      }
    }
  }
  saveAs() {
    if (this._saveAsDialog()) {
      this.requestData()
    }
  }
  quit(event=null) {
    const cancel = () => (event) ? event.preventDefault() : null
    if (!this.quitting) {
      if (this.saved) {
        if (!Util.isMac()) {
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
  }
  close() {
    // close all windows but don't quit on macOS
  }

  unsaved() {
    this.saved = false
    this._title()
  }
  requestData() {
    this.mainWindow.send({ action: 'save' })
  }
  writeData(data) { // call with data to save
    try {
      fs.writeFileSync(this.currentFilepath, JSON.stringify(data), 'utf8')
      this.currentProjectName = data.project.name
      this.mainWindow.send({ action: 'saved' })
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
  }

  _saveQuery() {
    const response = dialog.showMessageBoxSync(this.mainWindow.ref, { // must be sync
      type: 'question',
      buttons: ['Save', "Don't Save", 'Cancel'],
      title: this.appTitle,
      message: `Do you want to save your changes to ${this.currentProjectName}?`
    })
    switch (response) {
      case 0: return 'yes' // save
      case 1: return 'no' // don't save
      case 2: return 'cancel'
    }
  }
  _quitQuery() {
    const response = dialog.showMessageBoxSync(this.mainWindow.ref, { // must be sync
      type: 'question',
      buttons: ['Yes', 'No'],
      title: this.appTitle,
      message: 'Are you sure you want to quit?'
    });
    switch (response) {
      case 0: return 'yes' // quit
      case 1: return 'no' // don't quit
    }
  }
  _openDialog() {
    const result = dialog.showOpenDialogSync(this.mainWindow.ref, {
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
  }
  _saveAsDialog() {
    const result = dialog.showSaveDialogSync(this.mainWindow.ref, {
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
  }

  _new() {
    this.currentFilepath = null
    this.currentProjectName = this.defaultProjectName
    this.mainWindow.send({ action: 'new' })
    this._title()
  }
  _open() {
    try {
      const data = JSON.parse(fs.readFileSync(this.openingFilepath, 'utf8'))
      this.currentProjectName = Util.deepGet(data, ['project', 'name']) || this.defaultProjectName
      this.currentFilepath = this.openingFilepath
      this.openingFilepath = null
      this.mainWindow.send({ action: 'load', data })
      this._title()
    } catch (error) {
      this._error('Unable to open project', error.message)
    }
  }
  _quit() {
    this.quitting = true
    app.quit()
  }
  _close() {
    this.quitting = true
    Object.values(this.windows).forEach(win => win.close())
  }
  _error(msg, detail) {
    dialog.showMessageBox(this.mainWindow.ref, {
      type: 'error',
      title: this.appTitle,
      message: msg,
      detail,
    })
  }
  _title() {
    if (this.currentProjectName) {
      const saveIndicator = (this.saved) ? '' : '*'
      this.mainWindow.title(`${this.currentProjectName}${saveIndicator} - ${this.appTitle}`)
    } else {
      this.mainWindow.title(this.appTitle)
    }
  }
}