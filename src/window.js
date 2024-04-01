const { app, BrowserWindow, ipcMain, shell } = require('electron')
const mc = require('./minecraft')
const path = require('path')
const storage = require('electron-json-storage');
const fs = require('fs')
const { finished, Readable } = require('stream');
const rpc = require('./rpc');

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
    },
    icon: "icon.png"
  })
  window.setWindow = win;
  win.loadFile(path.join(__dirname, "index.html"))
  if (!fs.existsSync(storage.getDefaultDataPath())) fs.mkdirSync(storage.getDefaultDataPath())
  mc.checkJava();
  storage.has('mc', (err, hasKey) => {
    if (err) throw err;
    if (hasKey) {
      mc.refreshLogin();
    }
  })
  rpc.startRPC()
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

  ipcMain.handle("logout", async(event) => {
    mc.logout();
  })

  ipcMain.handle("uninstallMods", async(event) => {
    mc.uninstallMod()
  })

  ipcMain.handle("discordInvite", async(event) => {
    shell.openExternal("https://discord.gg/qNRvgqsBwU")
  })

  ipcMain.handle("setRPCName", async (event, name) => {
    rpc.setActivity("HySky Launcher", `In Launcher Menu (${name})`);
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