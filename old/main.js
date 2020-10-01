const electron = require('electron');
const path = require('path');
const url = require('url');
// Module to control application life.
const { app } = electron;
// Module to create native browser window.
const { BrowserWindow } = electron;
const { Menu } = electron;
const { ipcMain } = electron;
const { dialog } = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let saved = true;
let savedFilePath = '';
let projectName = 'New Project';
const appTitle = `FEGS Scoping Tool ${app.getVersion()} | BETA | US EPA`;
const windows = [];


const safeCall = func => (typeof func === 'function') ? func() : undefined

function saveQuery({ yes, no, cancel }) {
  const response = dialog.showMessageBoxSync(mainWindow, { // must be sync
    type: 'question',
    buttons: ['Save', "Don't Save", 'Cancel'],
    title: appTitle,
    message: `Do you want to save your changes to ${projectName}?`
  })
  switch (response) {
    case 0: safeCall(yes); break // save
    case 1: safeCall(no); break // don't save
    case 2: safeCall(cancel); break // cancel
  }
}

function saveDialog(action) {
  let filePath = savedFilePath || projectName; // filePath might not include extension
  dialog.showSaveDialog(mainWindow, {
    defaultPath: filePath,
    filters: [{
      name: 'Custom File Type',
      extensions: ['fegs']
    }]
  }).then(result => {
    if (!result.canceled) {
      filePath = result.filePath
      if (!filePath.endsWith('.fegs')) {
        filePath += '.fegs'
      }
      mainWindow.webContents.send(action, filePath)
    }
  }).catch(err => {
    console.error(err)
  })
}

// Use a dialog menu to specify a file to open
function openFile() {
  dialog.showOpenDialog(mainWindow, {
    filters: [{
      name: 'Custom File Type',
      extensions: ['fegs']
    }],
    properties: ['openFile']
  }).then(result => {
    if (!result.canceled) {
      const filePath = result.filePaths[0]
      if (!saved) {
        saveQuery({
          yes: () => mainWindow.webContents.send('save-and-open', filePath),
          no: () => {
            mainWindow.webContents.send('open-file', filePath)
            savedFilePath = filePath
            saved = true
          }
        })
      } else {
        mainWindow.webContents.send('open-file', filePath)
        savedFilePath = filePath
        saved = true
      }
    }
  }).catch(err => {
    console.error(err)
  })
}

// Send a message to the render thread to save the file
function saveFile() {
  mainWindow.webContents.send('save');
}

// Use a dialog menu to save the file and then send the message to the render thread
function saveFileAs() {
  saveDialog('save-as')
}

// Saves the file using a dialog and then refreshes the applcation to fresh state
function saveFileAsAndRefresh() {
  saveDialog('save-as-and-refresh')
}

// Save the file and then open the specified project
function saveFileAsAndOpen(saveName, openName) {
  saveDialog('save-as-and-open')
}

// Save and then quit the application
function saveFileAsAndQuit() {
  saveDialog('save-as-and-quit')
}

// Quit the application
function quit() { // File > Quit, Alt+F4, or Cmd+Q
  app.quit()
}

// Creates the main window of the application
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 1024,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    },
    title: appTitle
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  // Create the file menu at the top of the application
  const newProject = () => {
    savedFilePath = ''
    projectName = 'New Project'
    saved = true
    mainWindow.webContents.reloadIgnoringCache()
    mainWindow.setTitle(appTitle)
  }
  const cmd = (process.platform === 'darwin') ? 'Cmd' : 'Ctrl'
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: `${cmd}+N`,
          click: () => {
            if (!saved) {
              saveQuery({
                yes: () => mainWindow.webContents.send('save-and-refresh'),
                no: () => newProject()
              })
            } else {
              newProject()
            }
          }
        },
        {
          label: 'Open...',
          accelerator: `${cmd}+O`,
          click: openFile,
        },
        {
          type: 'separator'
        },
        {
          label: 'Save',
          accelerator: `${cmd}+S`,
          click: saveFile,
        },
        {
          label: 'Save As... ',
          accelerator: `${cmd}+Shift+S`,
          click: saveFileAs,
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: (process.platform === 'darwin') ? 'Cmd+Q' : 'Alt+F4',
          click: quit,
        }
      ]
    },
    {
      label: 'About',
      submenu: [
        {
          label: 'Tool Purpose',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              title: appTitle,
              message: 'Tool Purpose',
              detail:
                'The FEGS Scoping Tool informs the early stage of decision making, when decision makers are aware of a decision that needs to be made, but before any actions are taken. The tool helps users identify and prioritize stakeholders, beneficiaries, and environmental attributes through a structured, transparent, and repeatable process. These relevant and meaningful environmental attributes can then be used to evaluate decision alternatives.'
            });
          }
        },
        {
          label: 'Tool Methods',
          click: () => {
            const id = windows.length;
            let win = new BrowserWindow({
              width: 800,
              height: 600,
              frame: true,
              title: `Tool Methods - ${appTitle}`
            });
            win.setMenu(null);
            windows[id] = win;
            win.show();
            // and load the index.html of the app.
            win.loadURL(
              url.format({
                pathname: path.join(__dirname, 'methods.html'),
                protocol: 'file:',
                slashes: true,
                autoHideMenuBar: true
              })
            );

            // garbage collection handle
            win.on('closed', () => {
              win = null;
              windows[id] = null;
            });
          }
        }
      ]
    }
  ];

  // add dev tools item if not in production
  if (process.env.node_env && process.env.node_env.trim() === 'dev') {
    menuTemplate.push({
      label: 'Toggle DevTools',
      accelerator: process.platform === 'darwin' ? 'Command+I' : 'CTRL+I',
      click(item, focusedWindow) {
        focusedWindow.toggleDevTools();
      }
    });
  }

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('close', e => {
    if (saved) {
      if (process.platform !== 'darwin') { // will quit after close
        const choice = electron.dialog.showMessageBoxSync(mainWindow, {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: appTitle,
          message: 'Are you sure you want to quit?'
        });
        if (choice === 1) {
          e.preventDefault();
        }
      }
    } else {
      saveQuery({
        yes: () => {
          e.preventDefault()
          mainWindow.webContents.send('save-and-quit')
        },
        no: () => console.log('Quit'),
        cancel: () => e.preventDefault()
      })
    }
    windows.forEach(win => {
      if (win) {
        win.close();
      }
    });
  });

  mainWindow.webContents.on('crashed', () => {
    console.error('Crashed');
  });

  mainWindow.on('unresponsive', () => {
    console.warn('Unresponsive...');
  });
}

// Saves the file when the renderer returns the data
ipcMain.on('save-as', (event, arg) => {
  saveFileAs(arg);
});

// Saves the file then refresh when the renderer returns the data
ipcMain.on('save-as-and-refresh', (event, arg) => {
  saveFileAsAndRefresh(arg);
});

// Saves the file then open when the renderer returns the data
ipcMain.on('save-as-and-open', (event, saveName, openName) => {
  saveFileAsAndOpen(saveName, openName);
});

// Saves the file then quit when the renderer returns the data
ipcMain.on('save-as-and-quit', (event, saveName) => {
  saveFileAsAndQuit(saveName);
});

// Saves the file then refreshes when the renderer returns the data
ipcMain.on('save-and-refresh', (event, arg) => {
  saveFileAs(arg);
});

// Updates the project name when the renderer tells us to.
ipcMain.on('update-project-name', (event, arg) => {
  // console.log('update-project-name')
  // console.log(arg)
  projectName = arg;
});

// When the render thread sends a message update these variables
ipcMain.on('has-been-saved', (event, arg) => {
  // console.log("has-been-saved");
  // console.log(arg);
  savedFilePath = arg;
  saved = true;
});

// When the render thread sends a message update this variable
ipcMain.on('has-been-changed', () => {
  // console.log("has-been-changed");
  saved = false;
});

ipcMain.on('quit', () => {
  quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // console.log("window-all-closed");
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    quit()
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

process.on('uncaughtException', () => {
  console.error('uncaughtException');
});
