const { Readable } = require('stream');
const { Client } = require('minecraft-launcher-core');
const { Auth } = require('msmc');
const { finished } = require('stream');
const {readdir} = require("fs/promises");
const {downloadRelease} = require("@terascope/fetch-github-release")
const {Notification, BrowserWindow} = require('electron')

const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const storage = require("electron-json-storage")

const win = require('./window');

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

        const key = crypto.createDecipher('aes-128-cbc', data.id)
        let d_token = key.update(data.token, 'hex', 'utf8')
        d_token += key.final('utf8')
        
        authManager.refresh(d_token).then(async xboxManager => {
            win.window.getWindow.webContents.send("loggingIn");
            token.setToken =  await xboxManager.getMinecraft();
            const _token = await xboxManager.getMinecraft();
            win.window.getWindow.webContents.send("setSkin", _token.profile.id)
            win.window.getWindow.webContents.send("setName", _token.profile.name)
        }).catch((err) => win.window.getWindow.webContents.send("error", err['response']['status'], err['response']['statusText']))
    })
}

async function login() {
    win.window.getWindow.webContents.send("loggingIn");
    const authManager = new Auth("select_account");
    authManager.launch("raw").then(async xboxManager => {
        token.setToken =  await xboxManager.getMinecraft();
        const _token = await xboxManager.getMinecraft();

        // console.log(token.getToken.mcToken)

        const key = crypto.createCipher('aes-128-cbc', _token.profile.id)
        let login_token = key.update(xboxManager.msToken.refresh_token, 'utf8', 'hex')
        login_token += key.final('hex')

        storage.set('mc', {token: login_token, id: _token.profile.id}, (err) => {if (err) throw err;});
        win.window.getWindow.webContents.send("loggedIn");
        win.window.getWindow.webContents.send("setSkin", _token.profile.id)
        win.window.getWindow.webContents.send("setName", _token.profile.name)
    }).catch((err) => win.window.getWindow.webContents.send("error", err['response']['status'], err['response']['statusText']));
}

async function uninstallMod() {
    console.log(`Uninstalling mods`);
    fs.readdir(path.join(storage.getDefaultDataPath(), "/.minecraft/mods"), (err, files) => {
        if (err) throw err;

        files.forEach((file) => {
            fs.unlink(path.join(storage.getDefaultDataPath(), `/.minecraft/mods/${file}`), (err) => {if (err) throw err})
        })
        win.window.getWindow.webContents.send("mcConsole", '[HySky]: Uninstalled Mods')
    })
}

async function installMod(file) {
    console.log(file)
    if (!fs.existsSync(path.join(storage.getDefaultDataPath(), ".minecraft/mods"))) {
        if (!fs.existsSync(path.join(storage.getDefaultDataPath(), ".minecraft"))) {
            fs.mkdirSync(path.join(storage.getDefaultDataPath(), ".minecraft"))
        }
        fs.mkdirSync(path.join(storage.getDefaultDataPath(), ".minecraft/mods"))
    }
    const modsJson = JSON.parse(fs.readFileSync(path.join(__dirname, "mods.json"), 'utf8'))
    for (const mod in modsJson) {
        if (mod == file && modsJson[mod].installed == false) {
            const currentMod = modsJson[mod]
            downloadRelease(currentMod.user, currentMod.repo, path.join(storage.getDefaultDataPath(), ".minecraft/mods"), (release) => {
                return release.prerelease === false;
            }, (asset) => {
                return asset.name.includes('.jar')
            }, false, false).then(() => {
                console.log("[Lime]: Mod Installed")
                currentMod.installed = true
                modsJson[mod] = currentMod
                fs.writeFile(path.join(__dirname, "mods.json"), JSON.stringify(modsJson, null, 2), () => console.log("Wrote mod data to mods.json"))
                win.window.getWindow.webContents.send("mcConsole", `[HySky]: Installed Mod ${currentMod.name}`)
            }).catch((err) => {
                console.error(err.message)
            })
        }
    }
}

async function updateMods() {
    if (!fs.existsSync(path.join(storage.getDefaultDataPath(), ".minecraft/mods"))) return;

    const modsJson = JSON.parse(fs.readFileSync(path.join(__dirname, "mods.json"), 'utf8'))
    for (const mod in modsJson) {
        if (modsJson[mod].installed == true) {
            const currentMod = modsJson[mod]
            downloadRelease(currentMod.user, currentMod.repo, path.join(storage.getDefaultDataPath(), ".minecraft/mods"), (release) => {
                return release.prerelease === false;
            }, (asset) => {
                return asset.name.includes('.jar')
            }, false, false).then(() => {
                console.log("[Lime]: Mod Installed")
                currentMod.installed = true
                modsJson[mod] = currentMod
                fs.writeFile(path.join(__dirname, "mods.json"), JSON.stringify(modsJson, null, 2), () => console.log("Wrote mod data to mods.json"))
            }).catch((err) => {
                console.error(err.message)
            })
        }
    }
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
        }).catch((err) => {
            getJavaVM("C:\\Program Files\\Java").then((dirs) => {
                for (const dir of dirs) {
                    if (dir.includes("1.8")) {
                        javaPath = path.join("C:\\Program Files\\Java", dir, "\\bin\\java.exe")
                        console.log(`[Lime]: Set Java Path to ${javaPath}`)
                    }
                }
            })
        })
    }
}

async function checkForge() {
    const res = await fetch(`https://maven.minecraftforge.net/net/minecraftforge/forge/1.8.9-11.15.1.2318-1.8.9/forge-1.8.9-11.15.1.2318-1.8.9-universal.jar`);
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
exports.updateMods = updateMods;