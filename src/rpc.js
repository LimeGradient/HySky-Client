const DiscordRPC = require("discord-rpc");

const _clientID = atob("MTE3OTEyODE1MDE5NDY1NTQwMw==");
const RPC = new DiscordRPC.Client({transport: "ipc"});

DiscordRPC.register(_clientID);

async function setActivity(details, state) {
    if (!RPC) return;
    RPC.setActivity({
        details: details,
        state: state,
        startTimestamp: Date.now(),
        largeImageKey: 'default',
        largeImageText: "HySky Client",
        smallImageKey: 'default',
        smallImageText: "HySky Client",
        instance: false
    })
}

RPC.on('ready', async () => {
    setActivity("HySky Launcher", "In Launcher Menu");

    setInterval(() => {
        setActivity("HySky Launcher", "In Launcher Menu");
    }, 15 * 1000);
});

async function startRPC() {
    console.log(_clientID)
    RPC.login({clientId: _clientID}).catch((err) => {if (err) throw err});
}


exports.setActivity = setActivity;
exports.startRPC = startRPC;