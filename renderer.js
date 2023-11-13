const { ipcRenderer } = require("electron");
// const mc = require("./minecraft")

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector(".homePage").style.visibility = 'visible'
    document.querySelector(".modInstallPage").style.visibility = 'hidden'
})

document.querySelector(".launchButton").addEventListener("click", () => {
    ipcRenderer.invoke("launchMC").then(() => {
        console.log("[Lime]: Launching MC")
    })
})

document.querySelector(".loadModPage").addEventListener("click", () => {
    document.querySelector(".homePage").style.visibility = 'hidden'
    document.querySelector(".modInstallPage").style.visibility = 'visible'
})

document.querySelector(".loadHomePage").addEventListener("click", () => {
    document.querySelector(".homePage").style.visibility = 'visible'
    document.querySelector(".modInstallPage").style.visibility = 'hidden'
})

document.querySelector(".login").addEventListener("click", () => {
    ipcRenderer.invoke("login").then(() => {
        console.log("[Lime]: Logging In")
    })
})

document.querySelector('.getCheckedMods').addEventListener("click", () => {
    var checkedBoxes = document.querySelectorAll('input[name=mod]:checked');
    const ids = []
    for (let i = 0; i < checkedBoxes.length; i++) {
        ids.push(checkedBoxes[i].id)
    }
    ipcRenderer.invoke("installMods", ids).then(() => {
        console.log(ids)
        console.log("[Lime]: Installing Mods")
    })
})

ipcRenderer.on("setSkin", (event, profileId) => {
    document.querySelector("#loginHolder").removeChild(document.querySelector(".login"))
    const skinHead = document.createElement("img")
    skinHead.width = 100
    skinHead.height = 100
    skinHead.id = "skinHead"
    document.querySelector("#skinHolder").appendChild(skinHead)
    document.getElementById('skinHead').src = `https://mc-heads.net/avatar/${profileId}`
});

ipcRenderer.on('mcLaunched', (event) => document.querySelector(".launchButton").disabled = true);
ipcRenderer.on('mcClosed', (event) => document.querySelector(".launchButton").disabled = false);