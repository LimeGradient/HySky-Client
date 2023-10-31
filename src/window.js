const { app, BrowserWindow } = require('electron')
var fork = require('child_process').fork;
var auth = require('./auth')

function createWindow () {
    const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    }
  })

  win.loadFile('index.html')
  const scopes = {
    scopes: ["User.Read"],
  }
  auth.getTokenInteractive(win, scopes)
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})