import { BrowserWindow } from 'electron'
import path from 'path'
import url from 'url'

import BaseWindow from './BaseWindow.js'

export default class StaticWindow extends BaseWindow {
  constructor({ width=800, height=600, title, filename }) {
    super({ width, height })
    this.title = title
    this.filename = filename
  }
  create(parent) {
    this.ref = new BrowserWindow({
      parent,
      width: this.width,
      height: this.height,
      title: this.title,
      minimizable: false,
      backgroundColor: '#FFF', // enables sub-pixel anti-aliasing
    })
    this.ref.setMenu(null)
    this.ref.loadURL(
      url.format({
        pathname: path.join(__static, this.filename),
        protocol: 'file',
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