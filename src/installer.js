const { MSICreator } = require('electron-wix-msi')
const path = require('path')

async function run() {

    const msiCreator = new MSICreator({
        appDirectory: path.join(__dirname, "hysky-client-win32-x64/"),
        description: 'Hypixel Skyblock Client',
        exe: 'hysky-client',
        name: "HySky-Client",
        manufacturer: 'LimeGradient',
        version: '1.1.0',
        outputDirectory: path.join(__dirname, "/build"),
        icon: "icon.ico"
    });

    const supportBinaries = await msiCreator.create();

    await msiCreator.compile();
}

run()