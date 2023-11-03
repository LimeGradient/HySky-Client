const { app, BrowserWindow, protocol, net, shell } = require('electron')
var auth = require('./auth')
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
  // auth.getTokenInteractive(win, {})
  win.loadFile('index.html')
  auth.login(win);
}


app.whenReady().then(() => {
  createWindow()

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