const { app, BrowserWindow, ipcMain } = require('electron')
const mc = require('./minecraft')
const path = require('path')
const storage = require('electron-json-storage');
const fs = require('fs')
const { finished, Readable } = require('stream');

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

async function checkForge() {
  const res = await fetch(`https://emulator.limegradient.xyz/hysky/forge-1.8.9-11.15.1.2318-1.8.9-universal.jar`);
  if (fs.existsSync(path.join(storage.getDefaultDataPath(), `forge/forge-1.8.9-11.15.1.2318-1.8.9-universal.jar`))) return;
  fs.mkdirSync(path.join(storage.getDefaultDataPath(), "forge"))
  const dest = path.join(storage.getDefaultDataPath(), `forge/forge-1.8.9-11.15.1.2318-1.8.9-universal.jar`);
  const fileStream = fs.createWriteStream(dest, { flags: 'wx' });
  await finished(Readable.from(await res.body).pipe(fileStream), (err) => console.log(err));
  console.log(`[Lime]: Forge Installed`)
  window.getWindow.webContents.send("mcConsole", '[Lime]: Forge Installed')
}

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
  checkForge()
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