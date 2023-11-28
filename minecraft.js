const fs = require('fs')
const { Readable } = require('stream');
const { Client } = require('minecraft-launcher-core');
const { Auth } = require('msmc');
const path = require('path')
const win = require('./window');
const { finished } = require('stream');
const {readdir} = require("fs/promises");
const storage = require("electron-json-storage")

const launcher = new Client();
console.log(path.join(storage.getDefaultDataPath(), "mc.json"))

const token = {
    token: null,

    get getToken() {return this.token},
    set setToken(t) {this.token = t}
}

let javaPath;

async function logout() {
    fs.unlink(path.join(storage.getDefaultDataPath(), "mc.json"), (err) => {if (err) throw err})
    win.window.getWindow.webContents.send("logout");
}

async function refreshLogin() {
    storage.get('mc', (err, data) => {
        if (err) throw err;
        const authManager = new Auth("login");
        authManager.refresh(data.token).then(async xboxManager => {
            win.window.getWindow.webContents.send("loggingIn");
            token.setToken =  await xboxManager.getMinecraft();
            const _token = await xboxManager.getMinecraft();
            win.window.getWindow.webContents.send("setSkin", _token.profile.id)
            win.window.getWindow.webContents.send("setName", _token.profile.name)
        }).catch((err) => console.log(err))
    })
}

async function login() {
    win.window.getWindow.webContents.send("loggingIn");
    const authManager = new Auth("select_account");
    authManager.launch("raw").then(async xboxManager => {
        //Generate the Minecraft login token
        token.setToken =  await xboxManager.getMinecraft();
        // console.log(token.getToken)
        const _token = await xboxManager.getMinecraft();
        storage.set('mc', {token: xboxManager.msToken, id: _token.profile.id}, (err) => {if (err) throw err;});
        win.window.getWindow.webContents.send("loggedIn");
        win.window.getWindow.webContents.send("setSkin", _token.profile.id)
        win.window.getWindow.webContents.send("setName", _token.profile.name)
    }).catch((err) => console.log(err));
}

async function uninstallMod() {
    console.log(`Uninstalling mods`);
    fs.readdir(path.join(storage.getDefaultDataPath(), "/.minecraft/mods"), (err, files) => {
        if (err) throw err;

        files.forEach((file) => {
            fs.unlink(path.join(storage.getDefaultDataPath(), `/.minecraft/mods/${file}`), (err) => {if (err) throw err})
        })
    })
}

async function installMod(file) {
    console.log(file)
    const res = await fetch(`https://emulator.limegradient.xyz/hysky/${file}.jar`);
    if (!fs.existsSync(path.join(storage.getDefaultDataPath(), ".minecraft/mods"))) {
        fs.mkdirSync(path.join(storage.getDefaultDataPath(), ".minecraft"))
        fs.mkdirSync(path.join(storage.getDefaultDataPath(), ".minecraft/mods"))
    }
    if (fs.existsSync(path.join(storage.getDefaultDataPath(), `.minecraft/mods/${file}.jar`))) return;
    const dest = path.join(storage.getDefaultDataPath(), `.minecraft/mods/${file}.jar`);
    const fileStream = fs.createWriteStream(dest, { flags: 'wx' });
    await finished(Readable.from(await res.body).pipe(fileStream), (err) => console.log(err));
    console.log(`[Lime]: ${file.toUpperCase()} Installed`)
}

function checkJava() {
    const getJavaVM = async source => (await readdir(source, {withFileTypes: true})).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
    if (process.platform === "darwin") {
        getJavaVM("/Library/Java/JavaVirtualMachines/").then((dirs) => {
            for (const dir of dirs) {
                if (dir.includes("1.8")) {
                    javaPath = path.join("/Library/Java/JavaVirtualMachines/", dir, "/Contents/Home/bin/java")
                    console.log(`[Lime]: Set Java Path to ${javaPath}`)
                }
            }
        })
    }
    if (process.platform === "win32") {
        getJavaVM("C:\\Program Files (x86)\\Java").then((dirs) => {
            for (const dir of dirs) {
                if (dir.includes("1.8")) {
                    javaPath = path.join("C:\\Program Files (x86)\\Java", dir, "\\bin\\java.exe")
                    console.log(`[Lime]: Set Java Path to ${javaPath}`)
                }
            }
        })
    }
}

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

async function launchGame() {
    checkForge()
    let opts = {
        clientPackage: null,
        // Simply call this function to convert the msmc Minecraft object into a mclc authorization object
        authorization: token.getToken.mclc(),
        root: path.join(storage.getDefaultDataPath(), ".minecraft"),
        version: {
            number: "1.8.9",
            type: "release",
        },
        forge: path.join(storage.getDefaultDataPath(), "forge/forge-1.8.9-11.15.1.2318-1.8.9-universal.jar"),
        memory: {
            max: "4G",
            min: "4G"
        },
        javaPath: javaPath
    };
    console.log("[Lime]: Launching MC");
    launcher.launch(opts);

    launcher.on('debug', (e) => {
        console.log(e)
        win.window.getWindow.webContents.send("mcConsole", e)
    });
    launcher.on('data', (e) => {
        console.log(e)
        win.window.getWindow.webContents.send("mcConsole", e)
    });

    launcher.on('arguments', (e) => win.window.getWindow.webContents.send("mcLaunched"))
    launcher.on('close', (e) => win.window.getWindow.webContents.send('mcClosed'))
}

exports.installMod = installMod;
exports.login = login;
exports.launchGame = launchGame;
exports.checkJava = checkJava;
exports.refreshLogin = refreshLogin;
exports.logout = logout;
exports.uninstallMod = uninstallMod;