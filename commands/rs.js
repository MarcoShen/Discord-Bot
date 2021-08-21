const axios = require ('axios');
const osu = require("ojsama");
const Discord = require('discord.js');


module.exports = {
    name: 'rs',
    description: "osu",
    execute(message, args, client){

        // get osu ID
        var discID = message.member.id;
        var list = readProfile();
        


        getToken().then(token => {
            if(!args[0]){
                if(!list.hasOwnProperty(discID)){
                    message.channel.send("osu not linked.");
                    return;
                }
                var id = list[discID].osuID
                getUserID(token,id).then(userInfo => {
                    main(token, id, message, userInfo.username);
                })
            }else{
                getUserID(token,args[0]).then(userInfo => {
                    console.log(userInfo.id)
                    main(token, userInfo.id, message, userInfo.username);
                })
            }
        }).catch(err => console.log(err));
      
    }
}


function main(token, user, message, username){
    rs(token, user).then(data => {
        if(data.length == 0){
            message.channel.send('`'+ username + '` has no recent plays.');
            return;
        }
        data = data[0];
        
        getMap(data.beatmap.id).then(mapData => {
            getMaxCombo(token, data.beatmap.id).then(maxCombo => {
                var maxAcc = getMaxAcc(data.statistics.count_300,
                    data.statistics.count_100,
                    data.statistics.count_50,
                    data.statistics.count_miss,
                    data.passed,
                    data.beatmap.count_circles,
                    data.beatmap.count_sliders,
                    data.beatmap.count_spinners);

                var maxPP = getPP(mapData, data.mods, maxAcc, maxCombo, 0);
                var curPP = getPP(mapData, data.mods, data.accuracy, data.max_combo, data.statistics.count_miss);
                var embed = makeEmbed(data, maxCombo, curPP, maxPP, maxAcc);

                var mapObj = new Object();
                    mapObj.mapID = data.beatmap.id;
                    var jsonMap = JSON.stringify(mapObj);
                    console.log(jsonMap)
                    const fs = require('fs');
                    fs.writeFile('assets/latestBeatmap.json', jsonMap, (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log("JSON data is saved.");
                    });

                message.channel.send({
                    embed
                });

                
            })
        })  
    })
}



function getUserID(t, user){
    //log api used
    console.log(API_URL+ '/users/'+user+'/osu')
    const promise = axios.get(API_URL+ '/users/'+user+'/osu', {
        headers: {
            'Authorization': `Bearer ${t}`
        }
        })
    const dataPromise = promise.then((response) => response.data)
    return dataPromise
}

function getMap(mapID){
    const promise = axios.post("https://osu.ppy.sh/osu/" + mapID)
    const dataPromise = promise.then((response) => response.data)
    return dataPromise;
}

API_URL = 'https://osu.ppy.sh/api/v2'
TOKEN_URL = 'https://osu.ppy.sh/oauth/token'
TOKEN_DATA = {
    'client_id': 7946,
    'client_secret': 'DNyljviZudpOfRdybnVsivyqMS8wV3mmAPFqu3Oh',
    'grant_type': 'client_credentials',
    'scope': 'public'
};

function getToken(){
    const promise = axios.post(TOKEN_URL, data=TOKEN_DATA)
    const dataPromise = promise.then((response) => response.data.access_token)
    return dataPromise
}

function rs(t, user){
    // log api used
    console.log(API_URL+ '/users/'+ user +'/scores/recent?include_fails=1&mode=osu&limit=1')

    const promise = axios.get(API_URL+ '/users/'+ user +'/scores/recent?include_fails=1&mode=osu&limit=1', {
    headers: {
        'Authorization': `Bearer ${t}`
    }
    })
    const dataPromise = promise.then((response) => response.data)
    return dataPromise
}

function getMaxCombo(t, mapID){
    // log api used
    console.log(API_URL + '/beatmaps/'+ mapID)

    const promise = axios.get(API_URL + '/beatmaps/'+ mapID, {
    headers: {
        'Authorization': `Bearer ${t}`
    }
    })
    const dataPromise = promise.then((response) => response.data.max_combo)
    return dataPromise;
}

function readProfile(){
    var fs = require('fs');
    var data = fs.readFileSync('assets/profiles.json');
    return JSON.parse(data);
}

function makeEmbed(d, mc, pp, maxPP, maxAcc){
    var avatar = d.user.avatar_url;
    var mapName = d.beatmapset.title;
    var mapVersion = d.beatmap.version;
    var thumbnail = "https://b.ppy.sh/thumb/" + d.beatmapset.id + ".jpg";
    var mapURL = d.beatmap.url;
    var strMod = "No Mod"
    if(d.mods.length > 0){
        strMod = d.mods.join(' ');
        strMod = "+" + strMod;
    }

    var mapCompleted = -1;
    if(!d.passed){
        mapCompleted = (d.statistics.count_50 + d.statistics.count_100 + d.statistics.count_300 + d.statistics.count_miss)/(d.beatmap.count_circles + d.beatmap.count_sliders + d.beatmap.count_spinners);
        mapCompleted = (mapCompleted*100).toFixed(2)
    }
    
    var stars = d.beatmap.difficulty_rating.toFixed(2);
    var length = [Math.floor((d.beatmap.total_length/60)), d.beatmap.total_length % 60]
    var bpm = d.beatmap.bpm;

    var rank = "?";

    switch(d.rank){
        case "X": rank = "<:X_:877007801753432084>"; break;
        case "XH": rank = "<:XH:877007801510150185>"; break;
        case "S": rank = "<:S_:877007801786986526>"; break;
        case "SH": rank = "<:SH:877007801367531551>"; break;
        case "A": rank = "<:A_:877007801728237578>"; break;
        case "B": rank = "<:B_:877007801791176785>"; break;
        case "C": rank = "<:C_:877007801791152138>"; break;
        case "D": rank = "D (ping me to fix it)"; break;
        case "F": rank = "<:F_:877007801963126794>"; break;

    }

    var acc = (d.accuracy*100).toFixed(2);
    maxAcc = (maxAcc*100).toFixed(2);
    var score = d.score;
    var combo = d.max_combo;
    var maxCombo = mc;
    var hits = [d.statistics.count_300,d.statistics.count_100,
                d.statistics.count_50, d.statistics.count_miss];

    if(hits[3] > 0){
        var displayHits = ' ▸ [' + hits[0] + '/'+ hits[1] + '/' + hits[2] + '/**' + hits[3] + '**]';
    }else{
        var displayHits = ' ▸ [' + hits[0] + '/'+ hits[1] + '/' + hits[2] + '/' + hits[3] + ']';
    }
    

    var leftField = ' ' + combo + '/' + maxCombo + displayHits

    var info = '▸ ' + score + ' ▸ ' + length[0] + ':' + length[1] + ' ▸ ' + bpm + 'bpm';

    var nochoke = "\u200B"
    var rightField = "\u200B";
    if(!d.perfect){
        nochoke = 'No Choke: <:__:877033717166661632>';
        rightField = '```yaml\n' + maxPP + 'pp ▸ ' + maxAcc + '%\n```';
    }

    var completed = "";
    if(!d.passed){
        completed="\n▸Map Completion: **" + mapCompleted + "%**";
    }

    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(mapName + ' [' + mapVersion + '] ' + strMod + ' [' + stars + ' ★]', avatar, mapURL)
        .setThumbnail(thumbnail)
        .addFields({
                name: ' ' + rank + ' ▸ ' + leftField,
                value:  '```fix\n' + pp + 'pp ▸ '+ acc + '%\n```' + info + completed,
                inline: true
            },{
                name: nochoke,
                value: rightField,
                inline: true
            }
        )


    return embed;
}

function getMaxAcc(c300, c100, c50, c0, p, cir, slid, spin){
    // no choke formula
    var acc = 0;
    if(p){
        acc = ((c300+c0) * 300 + c100 * 100 + c50 * 50)/((c300+c100+c50+c0)*300);
    }else{
        acc = ((cir+slid+spin-c50-c100) * 300 + c100 * 100 + c50 * 50)/((cir+slid+spin)*300);
    }
    return acc;
}

function getPP(mapData, strMod, acc_percent, combo, nmiss){
    var mods = osu.modbits.none;
    acc_percent = Math.round(acc_percent * 10000.00)/100;

    strMod = strMod.join('');
    strMod = "+" + strMod;
    if (strMod.startsWith("+")) {
        mods = osu.modbits.from_string(strMod.slice(1) || "");
    }

    //console.log(strMod, acc_percent, combo, nmiss)

    // get mods, acc, combo, misses from command line arguments
    // format: +HDDT 95% 300x 1m
    var argv = process.argv;
    mods = osu.modbits.from_string(strMod.slice(1) || "");


    var parser = new osu.parser().feed(mapData);

    //console.log(">>>>>>>>>>>>>>>>>>>>>>>>>" + parser.map.toString());
        var map = parser.map;
        //console.log(map.toString());

        if (mods) {
            //console.log("+" + osu.modbits.string(mods));
        }

        var stars = new osu.diff().calc({map: map, mods: mods});
        
        var pp = osu.ppv2({
            stars: stars,
            combo: combo,
            nmiss: nmiss,
            acc_percent: acc_percent,
        });

        var max_combo = map.max_combo();
        combo = combo || max_combo;

        //console.log(pp.computed_accuracy.toString());
        //console.log(combo + "/" + max_combo + "x");

        //console.log(">>>>>>>>>>>>>>" + pp.toString());
        return pp.toString().split(' ')[0];
}