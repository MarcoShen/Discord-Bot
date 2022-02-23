const axios = require ('axios');

// osu key
const TOKEN_URL = 'https://osu.ppy.sh/oauth/authorize'
const TOKEN_DATA = {
    'client_id': 7946,
    'client_secret': 'DNyljviZudpOfRdybnVsivyqMS8wV3mmAPFqu3Oh',
    'grant_type': 'client_credentials',
    'scope': 'public'
};

// discord key
const discordKey = 'ODMxNzI3MjY0MzMxODU3OTYz.YHZcYA.v-BIyjFx3Shh0gMAJ2wAt_N__xY'

// config
const prefix = '.';
const activity_name = "Lost Ark Guides";
const activity_type = "WATCHING";



// GET functions
let methods = {};
methods.getOsuToken = function() {
    const promise = axios.post(TOKEN_URL, data=TOKEN_DATA);
    const dataPromise = promise.then((response) => response.data.access_token);
    return dataPromise;
}

methods.getDiscordKey = function() {
    return discordKey;
}

methods.getPrefix = function(){
    return prefix;
}

methods.getActivity = function(){
    return {activity_name, activity_type};
}


exports.methods = methods