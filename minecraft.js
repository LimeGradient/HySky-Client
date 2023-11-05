const { Client, Authenticator } = require('minecraft-launcher-core');
const { Auth } = require('msmc');
const win = require('./window')

const launcher = new Client();

async function launchGame() {
    const authManager = new Auth("select_account");
    authManager.launch("raw").then(async xboxManager => {
        //Generate the Minecraft login token
        const token = await xboxManager.getMinecraft();
        // Pulled from the Minecraft Launcher core docs.
        let opts = {
            clientPackage: null,
            // Simply call this function to convert the msmc Minecraft object into a mclc authorization object
            authorization: token.mclc(),
            root: "./.minecraft",
            version: {
                number: "1.18.2",
                type: "release"
            },
            memory: {
                max: "6G",
                min: "4G"
            }
        };
        console.log("Starting!");
        launcher.launch(opts);
    
        launcher.on('debug', (e) => console.log(e));
        launcher.on('data', (e) => console.log(e));
    });
}

exports.launchGame = launchGame;