const { app, BrowserWindow, protocol, ipcMain, ipcRenderer } = require('electron')
const mc = require('./minecraft')
const url = require('url')
const path = require('path')
const storage = require('electron-json-storage');

const mcToken = {
    mcToken: null,
    profile: null,

    get getToken() {return this.mcToken},
    set setToken(tkn) {this.mcToken = tkn},

    get getProfile() {return this.profile},
    set setProfile(p) {this.profile = p}
}
exports.mcToken = mcToken;

const window = {
    window: null,
    get getWindow() {return this.window},
    set setWindow(win) {this.window = win}
}
exports.window = window

function createWindow () {
    const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "HySky Client",
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    }
  })
  window.setWindow = win;
  win.loadFile('index.html')
  mc.checkJava();
  storage.has('mc', (err, hasKey) => {
    if (err) throw err;
    if (hasKey) {
      mc.refreshLogin();  
    }
  })
}

app.whenReady().then(() => {
  createWindow()

  ipcMain.handle("launchMC", async(event) => {
    mc.launchGame();
  })

  ipcMain.handle("installMods", async(event, mods) => {
    for (const mod in mods) {
      mc.installMod(mods[mod])
    }
  })

  ipcMain.handle("login", async(event) => {
    mc.login();
  })

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