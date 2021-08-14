const axios = require ('axios');
const Discord = require('discord.js');

module.exports = {
    name: 'rs',
    description: "osu",
    execute(message, args, client){

        // get osu ID
        var discID = message.member.id;
        var list = readProfile();
        if(list.hasOwnProperty(discID)){
            var user = list[discID].osuID;
        }else{
            message.channel.send("osu not linked.");
            return;
        }


        get_token().then(token => {
                rs(token, user).then(data => {
                    getMaxCombo(token, data.beatmap.id).then(maxCombo => {
                        var embed = makeEmbed(data, maxCombo);
                        message.channel.send({
                            embed
                        });
                    })  
                })
            })
            .catch(err => console.log(err))
        
        

    }
}

API_URL = 'https://osu.ppy.sh/api/v2'
TOKEN_URL = 'https://osu.ppy.sh/oauth/token'
TOKEN_DATA = {
    'client_id': 7946,
    'client_secret': 'DNyljviZudpOfRdybnVsivyqMS8wV3mmAPFqu3Oh',
    'grant_type': 'client_credentials',
    'scope': 'public'
};

function get_token(){
    const promise = axios.post(TOKEN_URL, data=TOKEN_DATA)
    const dataPromise = promise.then((response) => response.data.access_token)
    return dataPromise
}

function rs(t, user){
    const promise = axios.get(API_URL+ '/users/'+ user +'/scores/recent?include_fails=1&mode=osu&limit=1', {
    headers: {
        'Authorization': `Bearer ${t}`
    }
    })
    const dataPromise = promise.then((response) => response.data[0])
    return dataPromise
}

function getMaxCombo(t, mapID){
    const promise = axios.get(API_URL + '/beatmaps/'+ mapID, {
    headers: {
        'Authorization': `Bearer ${t}`
    }
    })
    const dataPromise = promise.then((response) => response.data.max_combo)
    return dataPromise
}

function readProfile(){
    var fs = require('fs');
    var data = fs.readFileSync('assets/profiles.json');
    return JSON.parse(data);
}

function makeEmbed(d, mc){
    var avatar = d.user.avatar_url;
    var mapName = d.beatmapset.title;
    var mapVersion = d.beatmap.version;
    var thumbnail = "https://b.ppy.sh/thumb/" + d.beatmapset.id + ".jpg";
    var mapURL = d.beatmap.url;
    var mods = "No Mod";
    var stars = d.beatmap.difficulty_rating.toFixed(2);
    var length = [(d.beatmap.total_length/60).toFixed(0), d.beatmap.total_length % 60];
    var bpm = d.beatmap.bpm;
    var rank = d.rank;
    var pp = 0;
    var maxPP = 0;
    var maxAcc = 0;
    var acc = (d.accuracy*100).toFixed(2);
    var score = d.score;
    var combo = d.max_combo;
    var maxCombo = mc;
    var hits = [d.statistics.count_300,d.statistics.count_100,
                d.statistics.count_50, d.statistics.count_miss];

    var displayHits = '▸ [' + hits[0] + '/'+ hits[1] + '/' + hits[2] + '/' + hits[3] + ']';

    getPP()

    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(mapName + ' [' + mapVersion + ']',avatar,mapURL)
        .setThumbnail(thumbnail)
        .setDescription(
            '▸ ' + stars + '★ ▸ +'+ mods + ' ▸ ' + length[0] + ':' + length[1] + ' ▸ ' + bpm + 'bpm ' +
            '\n▸ ' + rank + ' ▸ ' + pp + 'PP ▸ ' + acc + '%' +
            '\n▸' + score + ' ▸ ' + combo + '/' + maxCombo + displayHits +
            '\nNo choke: ' + maxPP + 'PP for ' + maxAcc + '%'
            
        )


    return embed;
}

function getPP(){
    
}