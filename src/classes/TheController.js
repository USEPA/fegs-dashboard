import { app, dialog } from 'electron'
import fs from 'fs'

import Util from './Util.js'

export default class TheController {
  constructor({ windows, appTitle }) {
    this.windows = windows
    this.mainWindow = windows.mainWindow
    this.appTitle = appTitle

    this.currentFilepath = null
    this.openingFilepath = null
    this.currentProjectName = null
    this.afterSaved = null

    this.saved = true
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
        this._requestData()
      }
    }
  }
  saveAs() {
    if (this._saveAsDialog()) {
      this._requestData()
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

  writeData(data) { // call with data to save
    try {
      fs.writeFileSync(this.currentFilepath, JSON.stringify(data), 'utf8')
      this.currentProjectName = Util.deepGet(data, ['project', 'name'])
      this.mainWindow.send({ cmd: 'saved' })
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
  unsave() {
    this.saved = false
  }
  setName(name) {
    this.currentProjectName = name
  }

  _requestData() {
    this.mainWindow.send({ cmd: 'save' })
  }

  _saveQuery() {
    const primaryMessage = `Do you want to save your changes to ${this.currentProjectName}?`
    const fallbackMessage = 'Do you want to save your changes?'
    const response = dialog.showMessageBoxSync(this.mainWindow.ref, { // must be sync
      type: 'question',
      buttons: ['Save', "Don't Save", 'Cancel'],
      title: this.appTitle,
      message: (this.currentProjectName) ? primaryMessage : fallbackMessage,
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
      defaultPath: this.currentFilepath || this.currentProjectName || 'Project',
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
    this.currentProjectName = null // set with message from render process
    this.mainWindow.send({ cmd: 'new' })
  }
  _open() {
    try {
      const data = JSON.parse(fs.readFileSync(this.openingFilepath, 'utf8'))
      this.currentFilepath = this.openingFilepath
      this.openingFilepath = null
      this.currentProjectName = null // set with message from render process
      this.saved = true
      this.mainWindow.send({ cmd: 'load', data }) 
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
}