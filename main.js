const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;

const path = require('path');
const url = require('url');

const {ipcMain} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let saved = true;
let savedFileName = "New Project";
let projectName = "New Project";

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    //frame: false
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  //**
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          click: () => {
            console.log("newFile")
            if (!saved) { // Check if unsaved
              verifyIntention(function () {
                
              });
            } else {
              mainWindow.webContents.reloadIgnoringCache();
              savedFileName = "New Project";
              saved = true;
            }
          }
        },
        {
          label: 'Open Project...',
          click: () => {
            openFile();

          }
        }, {
          label: 'Save Project',
          click: () => {
            saveFile();
          }
        }, {
          label: 'Save Project As...',
          click: () => {
            saveFileAs();
          }
        }, {
          type: 'separator'
        }, {
          type: 'separator'
        }, {
          label: 'Quit',
          click: () => {
            if (!saved) { // Check if unsaved
              verifyIntention(function () {
                quit();
              });
            } else {
              quit();
            }
          }
        }
      ]
    }, {
      label: 'Toggle DevTools',
      accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
      click: () => {
        mainWindow.webContents.toggleDevTools();
      }
    }, {
      label: 'About FEGS Scoping Tool',
      click: () => {
        const {dialog} = require('electron');
        dialog.showMessageBox(mainWindow, {
          title: "FEGS Scoping Tool",
          message: "MESSAGE",
          detail: "DETAIL"
        });
      }
    },
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  //**

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    console.log("closed")
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

function newFile() {
  console.log("newFile")
  if (!saved) { // Check if unsaved
    verifyIntention(function () {
      console.log("newFile reload")
      mainWindow.webContents.reloadIgnoringCache();
      savedFileName = "New Project";
      saved = true;
    });
  } else {
    mainWindow.webContents.reloadIgnoringCache();
    savedFileName = "New Project";
    saved = true;
  }
}

function openFile() {
  const {dialog} = require('electron');
  dialog.showOpenDialog({filters: [
    {name: 'Custom File Type', extensions: ['fegs']}
  ]},
  function (fileNames) {
    if (fileNames === undefined) { // fileNames is an array that contains all the selected files
      console.log("No file selected");
    } else {
      if (!saved) { // Check if unsaved
        verifyIntention(function () {
          mainWindow.webContents.send('open-file', fileNames);
          savedFileName = fileNames;
          saved = true;
        });
      } else {
        mainWindow.webContents.send('open-file', fileNames);
        savedFileName = fileNames;
        saved = true;
      }
    }
  });
}

function saveFile() {
  mainWindow.webContents.send('save');
}

function saveFileAs() {
  var nameToUse = savedFileName;
  console.log(projectName)
  console.log(savedFileName)
  if (projectName !== 'New Project' && savedFileName === "New Project") {
    nameToUse = projectName;
  }
  const {dialog} = require('electron');
  dialog.showSaveDialog(
  {
    defaultPath: nameToUse,
    filters: [
      {
        name: 'Custom File Type', 
        extensions: ['fegs']
      }
    ]
  }, 
  function (fileNames) {
    if (fileNames === undefined) { // fileNames is an array that contains all the selected files
      console.log("No file selected");
    } else {
      if(!fileNames.endsWith(".fegs")) {
        fileNames += ".fegs";
      }
      mainWindow.webContents.send('save-as', fileNames);
    }
  });
}

// Saves the file when the renderer returns the data
ipcMain.on('save-as', function(event, arg) {
  saveFileAs(arg);
});

// Updates the project name when the renderer tells us to.
ipcMain.on('update-project-name', function(event, arg) {
  console.log('update-project-name')
  console.log(arg)
  projectName = arg;
});

ipcMain.on('has-been-saved', function(event, arg) {
  console.log("has-been-saved");
  console.log(arg);
  savedFileName = arg;
  saved = true;
});

ipcMain.on('has-been-changed', function(event, arg) {
  console.log("has-been-changed");
  saved = false;
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// 
function verifyIntention(action) {
  console.log("verifyIntention");
  const {dialog} = require('electron');
  dialog.showMessageBox(mainWindow,
   {
     type: 'question',
     buttons: ["Save", "Don't Save", "Cancel"],
     title: 'FEGS Scoping Tool',
     message: 'Do you want to save your changes to ' + savedFileName + '?'
   },
  function (response) {
    console.log(response);
    if (response == 0) {
      console.log("Save and Quit");
      mainWindow.webContents.send('save-and-refresh');
    } else if (response == 2) {
      console.log("Cancel");
      return;
    }
    action();
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  console.log("window-all-closed");
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  quit();
});

function quit() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
