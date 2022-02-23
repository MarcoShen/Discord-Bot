const fs = require('fs');
const readline = require('readline');
const axios = require ('axios');
const keys = require('./config.js')
const general = require('../methods/general.js')
const ojsama = require("ojsama");
const moment = require ('moment');


API_URL = 'https://osu.ppy.sh/api/v2'
let methods = {};

// ====================== Getter / Setter ====================== //

// get target user
methods.getTargetUser = function(message, args) {
    if(args[0]) return args[0];
    if(general.methods.getSpeakerData(message) == null) return null
    return general.methods.getSpeakerData(message).osuID;
}

// get beatmap id
methods.getLatestBeatmap = function() {
    let file = fs.readFileSync('assets/latestBeatmap.json');
    return JSON.parse(file).mapID;
}


// set beatmap id
methods.setLatestBeatMap = function(beatmapID) {
    let mapObj = new Object();
    mapObj.mapID = beatmapID;
    let jsonMap = JSON.stringify(mapObj);
    const fs = require('fs');
    fs.writeFile('assets/latestBeatmap.json', jsonMap, (err) => {
        if (err) {
            throw err;
        }
        console.log(jsonMap);
    });
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
    let length = total_length;
    if(mods.includes('DT') || mods.includes('NC')) length = (length/1.5).toFixed()
    else if (mods.includes('HT')) length = (length/0.75).toFixed();

    let seconds = [Math.floor((length/60)), length % 60]
    if(seconds[1] < 10) seconds[1] = '0' + seconds[1]
    return seconds[0] + ':' + seconds[1]
}

methods.emBpm = function(bpm, mods){
    if(mods.includes('DT') || mods.includes('NC')) return (bpm*1.5).toFixed() + 'bpm';
    else if (mods.includes('HT')) return (bpm*0.75).toFixed() + 'bpm';
    return bpm + 'bpm'
}

methods.ppCheck = function(pp, mapData, play){
    if(pp == null) return this.getPP(mapData, play.mods, (play.accuracy*100).toFixed(2), play.max_combo, play.statistics.count_miss)[0];
    return pp.toFixed(2);
}

methods.getMapInfo = function(score, length, bpm, mods, time, choke){
    let arrow = ' ▸ '
    if(choke) return arrow + score + arrow + this.emLength(length, mods) + arrow + this.emBpm(bpm, mods)
    return arrow + score + arrow + this.emLength(length, mods) + arrow + this.emBpm(bpm, mods) + arrow + '<t:' + moment(time).unix() + ':R>';
}

methods.checkChoke = function(play, set){
    if(play.statistics.count_miss > 0) return true;
    if((play.max_combo/set.max_combo) < 0.95) return true;  // less than 95% combo consider choke
    return false;
}

methods.getChokeTitle = function(choke){
    if(choke) return '<:__:877033717166661632>';
    return '\u200B';
}

methods.getChokeValue = function(choke, time, play, set, mapData){
    let arrow = ' ▸ '
    if(choke){
        let noChokeAcc = this.getNoChokeAcc(play.statistics, set.count_circles, set.count_sliders, set.count_spinners);
        return '```ymal\n' + this.getPP(mapData, play.mods, noChokeAcc, set.max_combo, 0)[0] + 'pp' + arrow + noChokeAcc + '%```' + arrow + ' <t:' + moment(time).unix() + ':R>';
    }
    return '\u200B';
}

methods.getStars = function(mapData, mods, set){
    if (mods) return this.getPP(mapData, mods, 0, 0, 0)[1];
    return set.difficulty_rating;
}


// ==================== Calculations ==================== //

methods.getNoChokeAcc = function(stats, cir, slid, spin, passed){
    let acc;
    if(passed) acc = ((stats.count_300+stats.count_0) * 300 + stats.count_100 * 100 + stats.count_50 * 50)/((stats.count_300+stats.count_100+stats.count_50+stats.count_0)*300);
    else acc = ((cir+slid+spin-stats.count_50-stats.count_100) * 300 + stats.count_100 * 100 + stats.count_50 * 50)/((cir+slid+spin)*300);
    return (acc*100).toFixed(2);
}

methods.getWhatIf = function(mapData, mods, mapCombo, perfect){
    if(perfect) return '';
    let whatIf = [
        parseInt(methods.getPP(mapData, mods, 95, mapCombo, 0)[0]*100),
        parseInt(methods.getPP(mapData, mods, 98, mapCombo, 0)[0]*100),
        parseInt(methods.getPP(mapData, mods, 99, mapCombo, 0)[0]*100),
        parseInt(methods.getPP(mapData, mods, 100, mapCombo, 0)[0]*100)
    ]

    for(let i=0; i<whatIf.length; i++){
        whatIf[i] = (whatIf[i]/100).toFixed();
    }
    return '95% ' + whatIf[0] + 'pp | 98% ' + whatIf[1] + 'pp | 99% ' + whatIf[2] + 'pp | 100% ' + whatIf[3] + 'pp';
}


methods.getPP = function(mapData, strMod, acc_percent, combo, nmiss){
    var mods = ojsama.modbits.none;
    strMod = strMod.join('');
    strMod = "+" + strMod;
    if (strMod.startsWith("+")) {
        mods = ojsama.modbits.from_string(strMod.slice(1) || "");
    }

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

    return [pp.toString().split(' ')[0], stars.toString().split(' ')[0]];
}

// ================== PlayData class =================== //
class playData{
    constructor(play, set , mapData){
        this.mods = methods.emMods(play.mods);
        this.rank = methods.emRank(play.rank);
        this.hits = methods.emHits(play.statistics);
        this.acc = (play.accuracy*100).toFixed(2) + '%';
        this.pp = methods.ppCheck(play.pp, mapData, play) + 'pp';
        this.whatIf = methods.getWhatIf(mapData, play.mods, set.max_combo);
        this.time = '<t:' + moment(play.created_at).unix() + ':R>';
        this.mapURL = set.url;
        this.avatar = play.user.avatar_url;
        this.mapTitle = set.beatmapset.artist + ' - ' + set.beatmapset.title + ' [' + set.version + '] ';
        this.stars = ' [' + methods.getStars(mapData,play.mods,set) + '★] '
        this.thumbnail = set.beatmapset.covers.list;
        this.combo = 'x' + play.max_combo + '/' + set.max_combo;
        this.mapInfo = methods.getMapInfo(play.score, set.total_length, set.bpm, play.mods, play.created_at, methods.checkChoke(play, set));
        this.chokeTitle = methods.getChokeTitle(methods.checkChoke(play, set));
        this.chokeValue = methods.getChokeValue(methods.checkChoke(play, set), play.created_at, play, set, mapData)
        this.whatIf = methods.getWhatIf(mapData, play.mods, set.max_combo, play.perfect);
    }
}

class userData{
    constructor(user){
        this.avatar = user.avatar_url;
        this.flag = 'https://osu.ppy.sh/images/flags/' + user.country_code + '.png';
        this.profileURL = 'https://osu.ppy.sh/users/' + user.id;
        this.country = user.country_code;
        this.username = user.username;
        this.joinDate = moment(user.join_date).fromNow();
        this.level = user.statistics.level.current;
        this.progress = user.statistics.level.progress;
        this.globalRank = user.statistics.global_rank;
        this.countryRank = user.statistics.country_rank;
        this.pp = user.statistics.pp.toFixed();
        this.acc = user.statistics.hit_accuracy.toFixed(2);
        this.plays = user.statistics.play_count;
        this.playTime = (user.statistics.play_time/3600).toFixed();
        this.ss = user.statistics.grade_counts.ss;
        this.ssh = user.statistics.grade_counts.ssh;
        this.s = user.statistics.grade_counts.s;
        this.sh = user.statistics.grade_counts.sh;
        this.a = user.statistics.grade_counts.a;
    }
}


exports.methods = methods
exports.playData = playData
exports.userData = userData