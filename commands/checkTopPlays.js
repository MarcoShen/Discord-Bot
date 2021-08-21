const axios = require ('axios');
const fs = require('fs');
const Discord = require('discord.js');
const moment = require ('moment');

const USERS = ['Famoose', 'Duckrt', 'MarcoThePotato', 'BingBongNipNong', 'crain', '74-111-110', 'blade100a'];
var methods = {};

methods.check = function(client) {
    var channel = client.channels.cache.get('783032777292906500');
    var now = moment.utc();

    getToken().then(token => {

        // call api to search who is online
        //console.log('('+ moment.utc().format() +') Looking for online users...')
        getOnlineUsersData(token).then( map => {

            map.forEach((value, key) => {
               //console.log('('+ moment.utc().format() +') Checking top plays for ' + key)

                // loop thru plays
                for(var i=0; i<value.topPlays.length;i++){

                    var theMap = value.topPlays[i];
                    // top play made in last minute
                    
                    if (now.diff(theMap.created_at, "seconds") < 90){
                        var currI = i;
                        now = moment().utc();
                        //console.log(console.log('('+ moment.utc().format() +') Checking top plays for ' + key + ' made a top play at '));
                        getMaxCombo(token, theMap.beatmap.id).then(mapCombo => {
                            getRankings(token, value.id).then(newRanking => {
                                value.newRank = newRanking.statistics.global_rank;
                                value.newPP = newRanking.statistics.pp;
                                if(value.newRank != value.prevRank){
                                    channel.send(makeEmbed(value, currI, mapCombo))

                                    var mapObj = new Object();
                                    mapObj.mapID = theMap.beatmap.id;
                                    var jsonMap = JSON.stringify(mapObj);
                                    console.log(jsonMap)
                                    const fs = require('fs');
                                    fs.writeFile('assets/latestBeatmap.json', jsonMap, (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                        console.log("JSON data is saved.");
                                    });
                                }
                            })
                        })
                    }
                }
            })
        }
    );

}).catch(err => console.log(err));}

function makeEmbed(user, index, mapCombo){

    var playInfo = user.topPlays[index];

    var rank = "?";
    switch(playInfo.rank){
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

    var flag = user.country.toLowerCase();

    var rankGain = user.prevRank - user.newRank;
    var ppGain = (user.newPP - user.prevPP).toFixed();

    if(rankGain >= 0){
        rankGain = '+' + rankGain;
    }

    if(ppGain >= 0){
        ppGain = '+' + ppGain;
    }

    var displayHits = '[' + playInfo.statistics.count_300 + '/'+ playInfo.statistics.count_100 + '/' + playInfo.statistics.count_50 + '/' + playInfo.statistics.count_miss + ']';
    var mods = '';
    if (playInfo.mods.length > 0){
        mods = '+**' + data.mods.join('') + '**';
    }

    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('New #' + (index+1) + ' for ' + playInfo.user.username, playInfo.user.avatar_url, 'https://osu.ppy.sh/users/' + playInfo.user.id)
        .setTitle(playInfo.beatmapset.artist + ' - ' + playInfo.beatmapset.title + ' [' + playInfo.beatmap.version + ']')
        .setURL(playInfo.beatmap.url)
        .setDescription(
            rank + '(**' + playInfo.beatmap.difficulty_rating + ' ★**) ' + mods + ' ▸ x' + playInfo.max_combo + '/' + mapCombo + ' ▸ ' + displayHits +  
            '\n```fix\n'+ playInfo.pp.toFixed(2) + 'pp for ' + (playInfo.accuracy *100).toFixed(2) + '%'+'```' +
            'Ranking: #' + user.prevRank + ' -> #**' + user.newRank + '** ('+ rankGain +') ▸ ' + user.prevPP.toFixed() + 'pp -> **' + user.newPP.toFixed() + '**pp (' + ppGain + 'pp)'
        )
        .setImage(playInfo.beatmapset.covers.cover)
        .setFooter('played ' + moment.utc().diff(playInfo.created_at, "seconds") + ' seconds ago')
        ;

    
    return embed;

}

function getRankings(t,user){
    const promise = axios.get(API_URL+ '/users/'+ user +'/osu', {
        headers: {
            'Authorization': `Bearer ${t}`
        }
        })
        const dataPromise = promise.then((response) => response.data)
        return dataPromise
}

function getMaxCombo(t, mapID){

    const promise = axios.get(API_URL + '/beatmaps/'+ mapID, {
    headers: {
        'Authorization': `Bearer ${t}`
    }
    })
    const dataPromise = promise.then((response) => response.data.max_combo)
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
    return dataPromise;
}

function getTopPlays(t, user){
    const promise = axios.get(API_URL+ '/users/'+ user +'/scores/best?imode=osu&limit=100', {
    headers: {
        'Authorization': `Bearer ${t}`
    }
    })
    const dataPromise = promise.then((response) => response.data)
    return dataPromise
}

//return array of user
async function getOnlineUsersData(t){
    var users = [];
    var usersMap = new Map();
    
    const promise = axios.get(API_URL+ '/search?mode=user&query='+USERS.join('+'), {
        headers: {
            'Authorization': `Bearer ${t}`
        }
    }).then((response) => {
        var results = response.data.user.data;
        
        // create structure 

        for(var i=0;i<results.length;i++){
            if(USERS.includes(results[i].username) && results[i].is_online){
                var user = new User(results[i].username,results[i].id,null,null,null,null,null,null)
                users.push(user)
                usersMap.set(results[i].username, user)
            }
        }
        return;

    }).then (async()  => {
        var axiosArrUserInfo = []
        for(var i=0;i<users.length;i++){    
            axiosArrUserInfo.push(axios.get(API_URL+ '/users/'+ users[i].username +'/osu', {
                headers: {
                    'Authorization': `Bearer ${t}`
                }
            }));
        }
        
        await axios.all(axiosArrUserInfo).then(axios.spread(function(...responses) {
            for(var i=0;i<responses.length;i++){
                var user = usersMap.get(responses[i].data.username);
                user.prevRank = responses[i].data.statistics.global_rank;
                user.prevPP = responses[i].data.statistics.pp;
                user.country = responses[i].data.country.code;
            }
            
        }));
        await setTimeoutPromise(60000);
    }).then(async()  => {
        var axiosArrTopPlays = []
        for(var i=0;i<users.length;i++){    
            axiosArrTopPlays.push(axios.get(API_URL+ '/users/'+ users[i].id +'/scores/best?imode=osu&limit=100', {
                headers: {
                    'Authorization': `Bearer ${t}`
                }
            }));
        }

        
        
        await axios.all(axiosArrTopPlays).then(axios.spread(function(...responses) {
            for(var i=0;i<responses.length;i++){
                var user = usersMap.get(responses[i].data[0].user.username);
                user.topPlays = responses[i].data
            }       
        }));

        return usersMap;
    })

    return promise;

    
}

const setTimeoutPromise = timeout => new Promise(resolve => {        
    setTimeout(resolve, timeout);
  });

class User{
    constructor(username, id, topPlays, prevRank, newRank, prevPP, newPP, country){
        this.username = username;
        this.id = id;
        this.topPlays = topPlays;
        this.prevRank = prevRank;
        this.newRank = newRank;
        this.prevPP = prevPP;
        this.newPP = newPP;
        this.country = country;
    }
}


exports.methods = methods