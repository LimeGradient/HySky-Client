const { ipcRenderer } = require("electron");

document.querySelector(".launchButton").addEventListener("click", () => {
    ipcRenderer.invoke("launchMC").then(() => {
        console.log("[Lime]: Launching MC")
    })
})

document.querySelector(".loadModPage").addEventListener("click", () => {
    document.querySelector(".homePage").style.visibility = 'hidden'
    document.querySelector(".modInstallPage").style.visibility = 'visible'
    document.querySelector('.settings-page').style.visibility = 'hidden'
})

document.querySelector(".loadHomePage").addEventListener("click", () => {
    document.querySelector(".homePage").style.visibility = 'visible'
    document.querySelector(".modInstallPage").style.visibility = 'hidden'
    document.querySelector('.settings-page').style.visibility = 'hidden'
})

document.querySelector('.loadSettingsPage').addEventListener("click", () => {
    document.querySelector(".homePage").style.visibility = 'hidden'
    document.querySelector(".modInstallPage").style.visibility = 'hidden'
    document.querySelector('.settings-page').style.visibility = 'visible'
})

document.querySelector("#login").addEventListener("click", () => {
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

document.querySelector('.uninstallMods').addEventListener("click", () => {
    ipcRenderer.invoke("uninstallMods").then(() => {
        console.log("Uninstalling Mods")
    })
})

ipcRenderer.on("setSkin", (event, profileId) => {
    console.log("[Lime]: Setting Skin")

    document.querySelector("#loginHolder").removeChild(document.querySelector("#login"))
    const skinHead = document.createElement("img")
    skinHead.width = 50
    skinHead.height = 50
    skinHead.id = "skinHead"
    document.querySelector("#loginHolder").appendChild(skinHead)
    document.getElementById('skinHead').src = `https://mc-heads.net/avatar/${profileId}`

});

ipcRenderer.on("setName", (event, name) => {
    ipcRenderer.invoke("setRPCName", name);
})

ipcRenderer.on('mcLaunched', (event) => document.querySelector("#launchButton").disabled = true);
ipcRenderer.on('mcClosed', (event) => document.querySelector("#launchButton").disabled = false);

ipcRenderer.on('loggingIn', (event) => document.querySelector("#login").disabled = true);
ipcRenderer.on('loggedIn', (event) => document.querySelector("#login").disabled = false);

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