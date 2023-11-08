const fs = require('fs')
const { Readable } = require('stream');
const { Client } = require('minecraft-launcher-core');
const { Auth } = require('msmc');
const path = require('path')
const win = require('./window');
const { finished } = require('stream');
const {readdir} = require("fs/promises");
const { ipcRenderer } = require('electron');

const launcher = new Client();

const token = {
    token: null,

    get getToken() {return this.token},
    set setToken(t) {this.token = t}
}

const modLinks = ["https://emulator.limegradient.xyz/hysky/limecapes-1.1.jar"]

let javaPath;

async function login() {
    const authManager = new Auth("select_account");
    authManager.launch("raw").then(async xboxManager => {
        //Generate the Minecraft login token
        token.setToken =  await xboxManager.getMinecraft();
        // console.log(token.getToken)
        const _token = await xboxManager.getMinecraft();
        win.window.getWindow.webContents.send("setSkin", _token.profile.id)
        win.window.getWindow.webContents.send("setName", _token.profile.name)
    });
}

async function installMods() {
    for (const link of modLinks) {
        const res = await fetch(link);
        const fileName = link.split("/");
        if (fs.existsSync(path.join(__dirname, `./.minecraft/mods/${fileName[4]}`))) continue;
        const dest = path.join(__dirname, `./.minecraft/mods/${fileName[4]}`);
        const fileStream = fs.createWriteStream(dest, { flags: 'wx' });
        await finished(Readable.from(await res.buffer()).pipe(fileStream));
    }
    console.log('[Lime]: All Mods Installed')
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
}

async function launchGame() {
    let opts = {
        clientPackage: null,
        // Simply call this function to convert the msmc Minecraft object into a mclc authorization object
        authorization: token.getToken.mclc(),
        root: "./.minecraft",
        version: {
            number: "1.8.9",
            type: "release",
        },
        forge: path.join(__dirname, "forge/forge-1.8.9-11.15.1.2318-1.8.9-universal.jar"),
        memory: {
            max: "6G",
            min: "4G"
        },
        javaPath: javaPath
    };
    console.log("[Lime]: Launching MC");
    launcher.launch(opts);

    launcher.on('debug', (e) => {
        console.log(e)
    });
    launcher.on('data', (e) => {
        console.log(e)
    });

    launcher.on('arguments', (e) => win.window.getWindow.webContents.send("mcLaunched"))
    launcher.on('close', (e) => win.window.getWindow.webContents.send('mcClosed'))
}

exports.installMods = installMods;
exports.login = login;
exports.launchGame = launchGame;
exports.checkJava = checkJava;