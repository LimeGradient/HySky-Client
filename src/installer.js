const electronInstaller = require('electron-winstaller');

const path = require('path')

async function run() {
    try {
        await electronInstaller.createWindowsInstaller({
            appDirectory: path.join(__dirname, "../hysky-client-win32-x64"),
            outputDirectory: path.join(__dirname, "../build"),
            authors: "LimeGradient",
            exe: "hysky-client.exe",
            setupIcon: "resources/icon.ico"
        })
        console.log("Installer Created!")
    } catch (e) {
        console.error(`Installer Failed: ${e.message}`)
    }
}

run()