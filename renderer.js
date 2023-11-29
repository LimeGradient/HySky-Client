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

document.querySelector("#logout").addEventListener('click', () => {
    ipcRenderer.invoke("logout").then(() => {
        console.log("[Lime]: Logging Out")
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

document.querySelector('.uninstallMods').addEventListener("click", () => {
    ipcRenderer.invoke("uninstallMods").then(() => {
        console.log("Uninstalling Mods")
    })
})

document.querySelector('.discord-button').addEventListener("click", () => {
    ipcRenderer.invoke("discordInvite").then(() => {
        console.log("Opening Discord")
    })
})

ipcRenderer.on("setSkin", (event, profileId) => {
    document.querySelector("#loginHolder").removeChild(document.querySelector(".login"))
    const skinHead = document.createElement("img")
    skinHead.width = 100
    skinHead.height = 100
    skinHead.id = "skinHead"
    document.querySelector("#skinButton").appendChild(skinHead)
    document.getElementById('skinHead').src = `https://mc-heads.net/avatar/${profileId}`
});

ipcRenderer.on('mcLaunched', (event) => document.querySelector(".launchButton").disabled = true);
ipcRenderer.on('mcClosed', (event) => document.querySelector(".launchButton").disabled = false);

ipcRenderer.on('loggingIn', (event) => document.querySelector(".login").disabled = true);
ipcRenderer.on('loggedIn', (event) => document.querySelector(".login").disabled = false);

ipcRenderer.on('logout', (event) => {
    window.location.reload();
})

ipcRenderer.on('mcConsole', (event, data) => {
    document.querySelector(".launch-button-data").innerHTML = data;
})

function openAccountDropdown() {
    document.querySelector(".accDropdown").classList.toggle("show");
    window.onclick = (event) => {
        if (!event.target.matches('#skinButton')) {
            const dropdowns = document.getElementsByClassName('.accDropdown');
            for (let i = 0; i < dropdowns.length; i++) {
                const openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    }
}