const electronInstaller = require('electron-winstaller');

const path = require('path')

async function run() {
    console.log("Creating MSI Installer")
    try {
        await electronInstaller.createWindowsInstaller({
            appDirectory: path.join(__dirname, "../hysky-client-win32-x64"),
            outputDirectory: path.join(__dirname, "../build"),
            authors: "LimeGradient",
            exe: "hysky-client.exe",
            version: "2.0.0",
            setupIcon: path.join(__dirname, "../resources/icon.ico"),
            noMsi: false,
            setupExe: "HySky Installer",
            setupMsi: "HySky Installer"
        })
        console.log("Installer Created!")
    } catch (e) {
        console.error(`Installer Failed: ${e.message}`)
    }
}

run()