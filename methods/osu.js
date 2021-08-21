var fs = require('fs');
const readline = require('readline');
const axios = require ('axios');
const keys = require('./keys.js')
const general = require('../methods/general.js')


API_URL = 'https://osu.ppy.sh/api/v2'
var methods = {};

// ====================== Osu General ====================== //

// get target user
methods.getTargetUser = function(message, args) {
    if(!args[0]) return general.methods.getSpeakerData(message).osuID;
    return ;
}

// get beatmap id
methods.getLatestBeatmap = function() {
    var file = fs.readFileSync('assets/latestBeatmap.json');
    return JSON.parse(file).mapID;
}


// =================== API CALL methods =================== //

// get user id from username
methods.getUserID = function(username){
    const endpoint = '/users/' + username + '/osu';
    return callOsuAPI(endpoint).then(response => response.id);
}


// get user's beatmap score
methods.getUserBeatmapScore = function(beatmap, user){
    const endpoint = '/beatmaps/'+ beatmap + '/scores/users/' + user
    return callOsuAPI(endpoint).then(response => response);

}

// get beatmap set
methods.getBeatmapSet = function(beatmap){
    const endpoint = '/beatmaps/'+ beatmap
    return callOsuAPI(endpoint).then(response => response)
}

// get user
methods.getUser = function(user){
    const endpoint = '/users/'+ user
    return callOsuAPI(endpoint).then(response => response)
}

// get token
function callOsuAPI(ep){
    const promise = keys.methods.getOsuToken().then(t => {
        return axios.get(API_URL + ep, {
            headers: {
                'Authorization': `Bearer ${t}`
            }
        }).then(response => response)
    })
    return promise.then((response) => response.data)
}

// =================== Embed Data methods =================== //

methods.emRank = function(rank){
    var strRank = "Unknown";
    switch(rank){
        case "X": strRank = "<:X_:877007801753432084>"; break;
        case "XH": strRank = "<:XH:877007801510150185>"; break;
        case "S": strRank = "<:S_:877007801786986526>"; break;
        case "SH": strRank = "<:SH:877007801367531551>"; break;
        case "A": strRank = "<:A_:877007801728237578>"; break;
        case "B": strRank = "<:B_:877007801791176785>"; break;
        case "C": strRank = "<:C_:877007801791152138>"; break;
        case "D": strRank = "D (ping me to fix it)"; break;
        case "F": strRank = "<:F_:877007801963126794>"; break;
    }
    return strRank;
}

methods.emMods = function(mods){
    var strMod = 'No Mod'
    if(mods.length > 0) strMod = mods.join('');
    return '+' + strMod;
}

methods.emHits = function(stats){
    var hits = '[' + stats.count_300 + '/'+ stats.count_100 + '/' + stats.count_50 + '/';
    if(stats.count_miss > 0) hits +=  '**' + stats.count_miss + '**';
    else hits += stats.count_miss;
    return hits + ']';
}

methods.emLength = function(total_length, mods){
    var seconds = [Math.floor((total_length/60)), total_length % 60]
    if(seconds[1] < 10) seconds[1] = '0' + seconds[1]
    return seconds[0] + ':' + seconds[1]
}

methods.emBpm = function(bpm, mods){
    return bpm + 'bpm'
}


exports.methods = methods