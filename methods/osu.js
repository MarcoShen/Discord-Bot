const fs = require('fs');
const readline = require('readline');
const axios = require ('axios');
const keys = require('./keys.js')
const general = require('../methods/general.js')
const ojsama = require("ojsama");


API_URL = 'https://osu.ppy.sh/api/v2'
let methods = {};

// ====================== Osu General ====================== //

// get target user
methods.getTargetUser = function(message, args) {
    if(args[0]) return args[0];
    return general.methods.getSpeakerData(message).osuID;
}

// get beatmap id
methods.getLatestBeatmap = function() {
    let file = fs.readFileSync('assets/latestBeatmap.json');
    return JSON.parse(file).mapID;
}


// =================== API CALL methods =================== //

// get user's beatmap score
methods.getUserBeatmapScore = function(beatmap, user){
    const endpoint = '/beatmaps/'+ beatmap + '/scores/users/' + user
    return callOsuAPI(endpoint).then(response => response);
}

// get recent play
methods.getRecentScore = function(user){
    const endpoint = '/users/'+ user +'/scores/recent?include_fails=1&mode=osu&limit=1'
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

// get map data binary
methods.getMapData = function(betamapID){
    return axios.post("https://osu.ppy.sh/osu/" + betamapID).then(response => response.data)
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
    let strRank = "Unknown";
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
    let strMod = 'No Mod'
    if(mods.length > 0) strMod = mods.join('');
    return '+' + strMod;
}

methods.emHits = function(stats){
    let hits = '[' + stats.count_300 + '/'+ stats.count_100 + '/' + stats.count_50 + '/';
    if(stats.count_miss > 0) hits +=  '**' + stats.count_miss + '**';
    else hits += stats.count_miss;
    return hits + ']';
}

methods.emLength = function(total_length, mods){
    let seconds = [Math.floor((total_length/60)), total_length % 60]
    if(seconds[1] < 10) seconds[1] = '0' + seconds[1]
    return seconds[0] + ':' + seconds[1]
}

methods.emBpm = function(bpm, mods){
    return bpm + 'bpm'
}


// ==================== Calculations ==================== //

methods.getNoChokeAcc = function(stats, cir, slid, spin, passed){
    let acc;
    if(passed) acc = ((stats.count_300+stats.count_0) * 300 + stats.count_100 * 100 + stats.count_50 * 50)/((stats.count_300+stats.count_100+stats.count_50+stats.count_0)*300);
    else acc = ((cir+slid+spin-stats.count_50-stats.count_100) * 300 + stats.count_100 * 100 + stats.count_50 * 50)/((cir+slid+spin)*300);
    return (acc*100).toFixed(2);
}

methods.getWhatIf = function(mapData, mods, mapCombo){
    let whatIf = [
        parseInt(methods.getPP(mapData, mods, 95, mapCombo, 0)*100),
        parseInt(methods.getPP(mapData, mods, 98, mapCombo, 0)*100),
        parseInt(methods.getPP(mapData, mods, 99, mapCombo, 0)*100),
        parseInt(methods.getPP(mapData, mods, 100, mapCombo, 0)*100)
    ]

    for(let i=0; i<whatIf.length; i++){
        whatIf[i] = (whatIf[i]/100).toFixed();
    }
    return whatIf;
}


methods.getPP = function(mapData, strMod, acc_percent, combo, nmiss){
    var mods = ojsama.modbits.none;

    strMod = strMod.join('');
    strMod = "+" + strMod;
    if (strMod.startsWith("+")) {
        mods = ojsama.modbits.from_string(strMod.slice(1) || "");
    }

    var argv = process.argv;
    mods = ojsama.modbits.from_string(strMod.slice(1) || "");

    var parser = new ojsama.parser().feed(mapData);

    var map = parser.map;

    var stars = new ojsama.diff().calc({map: map, mods: mods});
    
    var pp = ojsama.ppv2({
        stars: stars,
        combo: combo,
        nmiss: nmiss,
        acc_percent: acc_percent,
    });

    var max_combo = map.max_combo();
    combo = combo || max_combo;

    return pp.toString().split(' ')[0];
}

exports.methods = methods