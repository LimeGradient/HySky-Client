import {
    UserAgentApplication,
    AuthenticationParameters,
    Configuration,
} from "@azure/msal";

async function tryLogin() {
    const config: Configuration = {
        auth: {
            clientId: "32aa0eba-d468-4ca2-9149-1643b8c5e254",
            authority: `https://login.microsoftonline.com/a7876e79-ee04-4e75-8edc-edef26bbbcbb`,
            redirectUri: "msal32aa0eba-d468-4ca2-9149-1643b8c5e254://auth",
        },
    };
    
    const params: AuthenticationParameters = {
        authority: `https://login.microsoftonline.com/a7876e79-ee04-4e75-8edc-edef26bbbcbb`,
        scopes: [`api://32aa0eba-d468-4ca2-9149-1643b8c5e254/User.Read`],
    };
    
    const myMSAL = new UserAgentApplication(config);
    
    try {
        const login = await myMSAL.acquireTokenSilent(params);
        console.log("login worked")
        console.log(login.accessToken);
    } catch (error) {
        await myMSAL.loginPopup(params);
        console.log("login failed")
        const login = await myMSAL.acquireTokenSilent(params);
        console.log(login.accessToken);
    }
}

tryLogin()