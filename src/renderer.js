const { ipcRenderer } = require("electron");

ipcRenderer.on("setLinkCode", (event, code) => {
    document.getElementById('linkCode').innerHTML = "Microsoft Link Code: " + code;
})

ipcRenderer.on("setSkin", (event, profileId) => {
    document.getElementById('skinHead').src = `https://mc-heads.net/avatar/${profileId}`
});