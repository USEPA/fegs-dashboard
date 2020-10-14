import { Menu } from 'electron'

import Util from './Util.js'

export default class TheMainMenu {
  constructor({ windows: { mainWindow, methodsWindow, purposeWindow }, controller }) {
    this.controller = controller
    this.mainWindow = mainWindow
    this.methodsWindow = methodsWindow
    this.purposeWindow = purposeWindow
  }
  create() {
    const menu = Menu.buildFromTemplate(this._template())
    Menu.setApplicationMenu(menu)
  }
  _template() {
    return [
      {
        label: 'File',
        submenu: [
          {
            label: 'New',
            accelerator: `CmdOrCtrl+N`,
            click: () => this.controller.new(),
          },
          {
            label: 'Open...',
            accelerator: `CmdOrCtrl+O`,
            click: () => this.controller.open(),
          },
          {
            type: 'separator'
          },
          {
            label: 'Save',
            accelerator: `CmdOrCtrl+S`,
            click: () => this.controller.save(),
          },
          {
            label: 'Save As... ',
            accelerator: `CmdOrCtrl+Shift+S`,
            click: () => this.controller.saveAs(),
          },
          {
            type: 'separator'
          },
          {
            label: Util.isMac() ? 'Quit' : 'Exit',
            accelerator: Util.isMac() ? 'Cmd+Q' : 'Alt+F4',
            click: () => this.controller.quit(),
          },
        ]
      },
      {
        label: 'About',
        submenu: [
          {
            label: 'Tool Purpose',
            click: () => this.purposeWindow.create(this.mainWindow.ref)
          },
          {
            label: 'Tool Methods',
            click: () => this.methodsWindow.create(this.mainWindow.ref)
          }
        ]
      },
      ...(Util.isDev() ? [{
        label: 'Toggle DevTools',
        accelerator: 'CmdOrCtrl+I',
        click: () => this.mainWindow.ref.webContents.toggleDevTools(),
      }] : [])
    ]
  }
} 