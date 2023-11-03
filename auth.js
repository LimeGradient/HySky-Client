/* Might revisit this auth code later but its deprecated for now
const { PublicClientApplication, CryptoProvider } = require('@azure/msal-node');

const MSAL_CONFIG = {
    auth: {
        clientId: "32aa0eba-d468-4ca2-9149-1643b8c5e254",
        authority: "https://login.microsoftonline.com/common",
    },
};

const pca = new PublicClientApplication(MSAL_CONFIG);
// The redirect URI you setup during app registration with a custom file protocol "msal"
const redirectUri = "msal://redirect";

const cryptoProvider = new CryptoProvider();

const pkceCodes = {
    challengeMethod: "S256", // Use SHA256 Algorithm
    verifier: "", // Generate a code verifier for the Auth Code Request first
    challenge: "" // Generate a code challenge from the previously generated code verifier
};

async function getTokenInteractive(authWindow, tokenRequest) {

    const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

    pkceCodes.verifier = verifier;
    pkceCodes.challenge = challenge;

    const authCodeUrlParams = {
        redirectUri: redirectUri,
        scopes: tokenRequest.scopes,
        codeChallenge: pkceCodes.challenge, // PKCE Code Challenge
        codeChallengeMethod: pkceCodes.challengeMethod // PKCE Code Challenge Method
    };

    const authCodeUrl = await pca.getAuthCodeUrl(authCodeUrlParams);
    //console.log(redirectUri.split(":")[1].replace("//",""))
    // console.log(authCodeUrl)
    // register the custom file protocol in redirect URI

    const authCode = await listenForAuthCode(authCodeUrl, authWindow); // see below

    const authResponse = await pca.acquireTokenByCode({
        redirectUri: redirectUri,
        scopes: tokenRequest.scopes,
        code: authCode,
        codeVerifier: pkceCodes.verifier // PKCE Code Verifier
    });

    const accessToken = authResponse.accessToken;
    console.log(accessToken)

    login(accessToken)

    return authResponse;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function listenForAuthCode(navigateUrl, authWindow) {
    authWindow.loadURL(navigateUrl);

    return new Promise((resolve, reject) => {
        authWindow.webContents.on('will-redirect', (event, responseUrl) => {
            try {
                const parsedUrl = new URL(responseUrl);
                const authCode = parsedUrl.searchParams.get('code');
                resolve(authCode);
            } catch (err) {
                console.log("auth code error")
                reject(err);
            }
        });
    });
}
const scopes = {
    scopes: ["User.Read", "XboxLive.signin"]
}

function login(accessToken) {
    fetch("https://user.auth.xboxlive.com/user/authenticate", {
        method: "POST",
        mode: 'cors',
        body: JSON.stringify({
            "Properties": {
                "AuthMethod": "RPS",
                "SiteName": "user.auth.xboxlive.com",
                "RpsTicket": "d="+accessToken // your access token from the previous step here
            },
            "RelyingParty": "http://auth.xboxlive.com",
            "TokenType": "JWT"
        }),
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    }).then((res) => {
        console.log(res)
    });
}

exports.getTokenInteractive = getTokenInteractive;
*/

// We use PrismarineJS now
const { Authflow, Titles } = require('prismarine-auth')
const win = require('./window')
const fs = require('fs')
const {shell} = require('electron')
const {open} = require('node:fs/promises')
const path = require('node:path')

function login(_win) {
    const mainScript = require('./window')

    const userIdentifier = "uid001"
    const cacheDir = './cache/'
    const flow = new Authflow(userIdentifier, cacheDir)
    
    const util = require('util');
    const log_stdout = process.stdout;

    fs.readdir(cacheDir, function(err, files) {
        if (err) {
           // some sort of error
        } else {
           if (!files.length) {
            console.info = function (d) { //
                log_stdout.write(util.format(d) + '\n');
                if (util.format(d).includes("code")) {
                    console.log(util.format(d).split("code")[1].split(" ")[1]) // What the fuck is this
                    _win.webContents.send("setLinkCode", "Microsoft Link Code: " + util.format(d).split("code")[1].split(" ")[1])
                    shell.openExternal("https://www.microsoft.com/link")
                }
            };
           }
        }
    });

    
    flow.getMinecraftJavaToken({fetchProfile: true}).then((res) => {
      win.mcToken.setToken = res.token;
      win.mcToken.setProfile = res.profile;
      _win.webContents.send("setSkin", res.profile.id)
      _win.webContents.send("setName", res.profile.name)
      _win.webContents.send("setLinkCode", "")
    })
}

function isDirEmpty(dirname) {
    return fs.promises.readdir(dirname).then(files => {
        return files.length === 0;
    });
}

exports.login = login;