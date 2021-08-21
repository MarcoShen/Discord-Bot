const axios = require ('axios');

API_URL = 'https://osu.ppy.sh/api/v2'
TOKEN_URL = 'https://osu.ppy.sh/oauth/token'
TOKEN_DATA = {
    'client_id': 7946,
    'client_secret': 'DNyljviZudpOfRdybnVsivyqMS8wV3mmAPFqu3Oh',
    'grant_type': 'client_credentials',
    'scope': 'public'
};



var methods = {};

methods.getOsuToken = function() {
    const promise = axios.post(TOKEN_URL, data=TOKEN_DATA);
    const dataPromise = promise.then((response) => response.data.access_token);
    return dataPromise;
}


exports.methods = methods