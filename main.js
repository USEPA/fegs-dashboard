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
    webPreferences: {
      nodeIntegration: true
    }
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
            if (!saved) { // Check if unsaved
              const {dialog} = require('electron');
              dialog.showMessageBox(mainWindow,
              {
                type: 'question',
                buttons: ["Save", "Don't Save", "Cancel"],
                title: 'FEGS Scoping Tool',
                message: 'Do you want to save your changes to ' + savedFileName + '?'
              },
              function (response) {
                if (response == 0) {
                  mainWindow.webContents.send('save-and-refresh');
                } else if (response == 1) {
                  mainWindow.webContents.reloadIgnoringCache();
                  savedFileName = "New Project";
                  projectName = "New Project";
                  saved = true;
                }
              });
            } else {
              mainWindow.webContents.reloadIgnoringCache();
              savedFileName = "New Project";
              projectName = "New Project";
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
            quit();
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
      label: 'About',
      submenu: [
        {
          label: 'Tool Purpose',
          click: () => {
            const {dialog} = require('electron');
            dialog.showMessageBox(mainWindow, {
              title: "FEGS Scoping Tool",
              message: "Tool Purpose",
              detail: "The FEGS Scoping Tool informs the early stage of decision making, when decision makers are aware of a decision that needs to be made, but before any actions are taken. The tool helps users identify and prioritize stakeholders, beneficiaries, and environmental attributes through a structured, transparent, and repeatable process. These relevant and meaningful environmental attributes can then be used to evaluate decision alternatives."
            });
          }
        },
        {
          label: 'Tool Methods',
          click: () => {
            const {BrowserWindow} = require('electron')
            let win = new BrowserWindow({width: 800, height: 600, frame: true})
            win.setMenu(null);
            win.show()
            // and load the index.html of the app.
            win.loadURL(url.format({
              pathname: path.join(__dirname, 'methods.html'),
              protocol: 'file:',
              slashes: true,
              autoHideMenuBar: true
            }));
          }
        }
      ]
    },
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('close', function(e) {
    if (saved) {
      var choice = require('electron').dialog.showMessageBox(this,
        {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'FEGS Scoping Tool',
          message: 'Are you sure you want to quit?'
        });
      if (choice == 1) {
        e.preventDefault();
      }
    } else {
      const {dialog} = require('electron');
      var choice = dialog.showMessageBox(this,
        {
          type: 'question',
          buttons: ["Save", "Don't Save", "Cancel"],
          title: 'FEGS Scoping Tool',
          message: 'Do you want to save your changes to ' + savedFileName + '?'
        });
        console.log(choice);
        if (choice == 0) {
          console.log("Save and Quit");
          e.preventDefault();
          mainWindow.webContents.send('save-and-quit');
        } else if (choice == 2) {
          console.log("Cancel quit");
          e.preventDefault();
          return;
        } else {
          console.log("just quit")
        }
      }
  });
}

function openFile() {
  console.log("open file")
  const {dialog} = require('electron');
  dialog.showOpenDialog({filters: [
    {name: 'Custom File Type', extensions: ['fegs']}
  ]},
  function (fileNames) {
    if (fileNames === undefined) { // fileNames is an array that contains all the selected files
      console.log("No file selected");
    } else {
      if (!saved) { // Check if unsaved
        console.log("not saved")
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
            console.log("Save and Open");
            mainWindow.webContents.send('save-and-open', fileNames);
          } else if (response == 2) {
            console.log("Cancel");
            return;
          } else {
            console.log("Just open");
            mainWindow.webContents.send('open-file', fileNames);
            savedFileName = fileNames;
            saved = true;
          }
        });
      } else {
        console.log("saved")
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

function saveFileAsAndRefresh() {
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
      mainWindow.webContents.send('save-as-and-refresh', fileNames);
    }
  });
}

function saveFileAsAndOpen(saveName, openName) {
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
      mainWindow.webContents.send('save-as-and-open', fileNames, openName);
    }
  });
}

function saveFileAsAndQuit() {
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
      mainWindow.webContents.send('save-as-and-quit', fileNames);
    }
  });
}

// Saves the file when the renderer returns the data
ipcMain.on('save-as', function(event, arg) {
  saveFileAs(arg);
});

// Saves the file then refresh when the renderer returns the data
ipcMain.on('save-as-and-refresh', function(event, arg) {
  saveFileAsAndRefresh(arg);
});

// Saves the file then open when the renderer returns the data
ipcMain.on('save-as-and-open', function(event, saveName, openName) {
  saveFileAsAndOpen(saveName, openName);
});

// Saves the file then quit when the renderer returns the data
ipcMain.on('save-as-and-quit', function(event, saveName) {
  saveFileAsAndQuit(saveName);
});

// Saves the file then refreshes when the renderer returns the data
ipcMain.on('save-and-refresh', function(event, arg) {
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

ipcMain.on('quit', function(event, arg) {
  quit();
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
