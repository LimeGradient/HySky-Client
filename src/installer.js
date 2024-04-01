const { MSICreator } = require('electron-wix-msi')
const path = require('path')

async function run() {

    const msiCreator = new MSICreator({
        appDirectory: path.join(__dirname, "../hysky-client-win32-x64/"),
        description: 'Hypixel Skyblock Client',
        exe: 'hysky-client',
        name: "HySky-Client",
        manufacturer: 'LimeGradient',
        version: '2.0.0',
        outputDirectory: path.join(__dirname, "../build"),
        icon: "resources/icon.ico",

        ui: {
            chooseDirectory: true
        }
    });

    msiCreator.create().then(() => {
        msiCreator.compile()
    })
}

run()