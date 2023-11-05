const { app, BrowserWindow, protocol, net, shell, ipcRenderer, ipcMain } = require('electron')
var auth = require('./auth')
const mc = require('./minecraft')
const url = require('url')
const path = require('path')

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
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    }
  })
  window.setWindow = win;
  win.loadFile('index.html')
  mc.login();
}

app.whenReady().then(() => {
  createWindow()

  ipcMain.handle("launchMC", async(event) => {
    mc.launchGame();
  })

  protocol.registerFileProtocol('msal', (request, callback) => {
    const requestUrl = url.parse(request.url, true);
    callback({path: path.normalize(`${__dirname}/index.html${requestUrl.search}`)});
    setTimeout(() => {
        window.getWindow.loadFile('index.html');
    }, 5000)
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
// r3f8Q~DjH-oVvUj3ffwIxJr26G5UcIPdYlORwdmm