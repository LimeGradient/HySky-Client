const { ipcRenderer } = require("electron");

ipcRenderer.on("setLinkCode", (event, code) => {
    document.getElementById('linkCode').innerHTML = code;
})

ipcRenderer.on("setSkin", (event, profileId) => {
    document.getElementById('skinHead').src = `https://mc-heads.net/avatar/${profileId}`
});

ipcRenderer.on("setName", (event, name) => {
    document.getElementById('mcName').innerHTML = `Logged In as ${name}`
})