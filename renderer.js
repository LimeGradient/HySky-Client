const { ipcRenderer } = require("electron");
// const mc = require("./minecraft")

document.querySelector(".launchButton").addEventListener("click", () => {
    ipcRenderer.invoke("launchMC").then(() => {
        console.log("[Lime]: Launching MC")
    })
})

ipcRenderer.on("setLinkCode", (event, code) => {
    document.getElementById('linkCode').innerHTML = code;
})

ipcRenderer.on("setSkin", (event, profileId) => {
    document.getElementById('skinHead').src = `https://mc-heads.net/avatar/${profileId}`
});

ipcRenderer.on("setName", (event, name) => {
    document.getElementById('mcName').innerHTML = `Logged In as ${name}`
})