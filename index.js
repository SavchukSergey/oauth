const clientOrigin = window.location.origin;
const scope = "chat.chats chat.settings";
const redirectUri = `${clientOrigin}/oauth/`;


const lblClientOrigin = document.getElementById("clientOrigin");
const txtEndpoint = document.getElementById("endpoint");
const txtClientId = document.getElementById("clientId");
const txtClientSecret = document.getElementById("clientSecret");
const btnStart = document.getElementById("start");
const btnExchange = document.getElementById("exchangeCode");
const btnTest = document.getElementById("test");
const btnRefresh = document.getElementById("refresh");

const txtCode = document.getElementById("code");
const txtAccessToken = document.getElementById("accessToken");
const txtRefreshToken = document.getElementById("refreshToken");

function init() {
    lblClientOrigin.innerText = clientOrigin;
    
    txtEndpoint.value = window.localStorage.getItem("endpoint") || "";
    txtEndpoint.addEventListener("change", () => {
        window.localStorage.setItem("endpoint", txtEndpoint.value);
    });

    txtClientId.value = window.localStorage.getItem("clientId") || "";
    txtClientId.addEventListener("change", () => {
        window.localStorage.setItem("clientId", txtClientId.value);
    })

    txtClientSecret.value = window.localStorage.getItem("clientSecret") || "";
    txtClientSecret.addEventListener("change", () => {
        window.localStorage.setItem("clientSecret", txtClientSecret.value);
    })

    txtAccessToken.value = window.sessionStorage.getItem("accessToken") || "";
    txtRefreshToken.value = window.sessionStorage.getItem("refreshToken") || "";
    try {
        txtCode.value = /code=([0-9a-z]+)/.exec(window.location.search || "")[1];
    } catch {
    }
}

init();

function addToLog(data) {
    const logNode = document.getElementById("log");
    const json = JSON.stringify(data);

    const log = document.createElement("pre");
    const hr = document.createElement("hr");
    log.innerText = json;
    logNode.insertBefore(hr, logNode.firstChild);
    logNode.insertBefore(log, logNode.firstChild);
}

btnStart.addEventListener("click", () => {
    const url = `${txtEndpoint.value}/authorize?client_id=${txtClientId.value}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}`;
    window.location = url;
});

btnExchange.addEventListener("click", () => {
    fetch(`${txtEndpoint.value}/token`, {
        method: "POST",
        body: `code=${txtCode.value}&redirect_uri=${redirectUri}&client_id=${txtClientId.value}&client_secret=${txtClientSecret.value}&grant_type=authorization_code`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        credentials: "omit",
        mode: "no-cors"
    }).then(response => response.json()).then(response => {
        txtAccessToken.value = response.access_token || "";
        txtRefreshToken.value = response.refresh_token || "";
        addToLog(response);
        window.sessionStorage.setItem("accessToken", response.access_token);
        window.sessionStorage.setItem("refreshToken", response.refresh_token);
        window.location = redirectUri;
    });
});

btnTest.addEventListener("click", () => {
    fetch(`${txtEndpoint.value}/me`, {
        headers: {
            "Authorization": `Bearer ${txtAccessToken.value}`
        },
        credentials: "omit",
        mode: "no-cors"
    }).then(response => response.json()).then(response => {
        addToLog(response);
    });
});

btnRefresh.addEventListener("click", () => {
    const refreshToken = txtRefreshToken.value;

    fetch(`${txtEndpoint.value}/oauth/token`, {
        method: "POST",
        body: `refresh_token=${refreshToken}&client_id=${txtClientId.value}&client_secret=${txtClientSecret.value}&grant_type=refresh_token`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        mode: "no-cors",
        credentials: "omit"
    }).then(response => response.json()).then(response => {
        txtAccessToken.value = response.access_token || "";
        txtRefreshToken.value = response.refresh_token || "";

        window.sessionStorage.setItem("accessToken", response.access_token || "");
        window.sessionStorage.setItem("refreshToken", response.refresh_token || "");

        addToLog(response);
    });
});
