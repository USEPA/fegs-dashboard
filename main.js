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
          label: 'Open File...',
          click: () => {
            openFile();
          }
        }, {
          label: 'Save',
          click: () => {
            saveFile();
          }
        }, {
          label: 'Save As...',
          click: () => {
            console.log("click")
            saveFileAs();
          }
        }, {
          type: 'separator'
        }, {
          label: 'About ...',
          click: () => {
            console.log('About Clicked');
          }
        }, {
          type: 'separator'
        }, {
          label: 'Quit',
          click: () => {
            app.quit();
          }
        }
      ]
    }, {
      label: 'Toggle DevTools',
      accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
      click: () => {
        mainWindow.webContents.toggleDevTools();
      }
    }
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  //**

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

function openFile() {
  const {dialog} = require('electron');
  const fs = require('fs');
  dialog.showOpenDialog(function (fileNames) {
    
    if (fileNames === undefined) { // fileNames is an array that contains all the selected files
      console.log("No file selected");
    
    } else {
      //readFile(fileNames[0]);
      mainWindow.webContents.send('open-file', fileNames);
    }
  });

  function readFile(filepath) {
    fs.readFile(filepath, 'utf-8', (err, data) => {
       if (err) { 
         console.log("An error ocurred reading the file :" + err.message);
         return;
       }
       console.log(data); // handle the file content. data contains the data read from the file
    });
  }
}

function saveFile() {
  const {ipcMain} = require('electron');
  const fs = require('fs');
  ipcMain.on('synchronous-message', (event, documentText) => {
    var message = 'synchronous message was received from page by main.js';
    console.log(message);
    fs.writeFile('windex.html', documentText);
  });
}

function saveFileAs() {
  console.log("saveFileAs");
  const {dialog} = require('electron');
  dialog.showSaveDialog
  ({filters: [
    {name: 'Custom File Type', extensions: ['fegs']},
    {name: 'All Files', extensions: ['*']}
  ]}, 
  function (fileNames) {
    if (fileNames === undefined) { // fileNames is an array that contains all the selected files
      console.log("No file selected");
    } else {
      console.log("get data to save");
      //mainWindow.webContents.send('data-request', fileNames);
      if(!fileNames.endsWith(".fegs")) {
        fileNames += ".fegs";
      }
      mainWindow.webContents.send('save-as', fileNames);
    }
  });
}

function writeFile(filepath, content) {
  const fs = require('fs');
  fs.writeFile(filepath, content, (err) => {
    console.log(filepath);
    if (err) { 
      mainWindow.webContents.send('data-written', "An error ocurred saving the file: " + err.message);
      console.log("An error ocurred saving the file:" + err.message);
      return;
    }
    mainWindow.webContents.send('data-written', "The file has been saved");
    console.log("The file has been saved.");
  });
}

// Saves the file when the renderer returns the data
ipcMain.on('data-message', function(event, arg) {
  console.log(arg)
  writeFile(arg[1], arg[0]);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// Listen for async message from renderer process
ipcMain.on('async', (event, arg) => {  
  // Print 1
  console.log(arg);
  // Reply on async message from renderer process
  event.sender.send('async-reply', 2);
});

// Listen for sync message from renderer process
ipcMain.on('sync', (event, arg) => {  
  // Print 3
  console.log(arg);
  // Send value synchronously back to renderer process
  event.returnValue = 4;
  // Send async message to renderer process
  mainWindow.webContents.send('ping', 5);
});

