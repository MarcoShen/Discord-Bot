const axios = require ('axios');

const TOKEN_URL = 'https://osu.ppy.sh/oauth/token'
const TOKEN_DATA = {
    'client_id': 7946,
    'client_secret': 'DNyljviZudpOfRdybnVsivyqMS8wV3mmAPFqu3Oh',
    'grant_type': 'client_credentials',
    'scope': 'public'
};

const discordKey = 'ODMxNzI3MjY0MzMxODU3OTYz.YHZcYA.t8r8VFErAb5qvKyYyC9Gq9cD8I0'




let methods = {};

methods.getOsuToken = function() {
    const promise = axios.post(TOKEN_URL, data=TOKEN_DATA);
    const dataPromise = promise.then((response) => response.data.access_token);
    return dataPromise;
}

methods.getDiscordKey = function() {
    return discordKey
}


exports.methods = methods