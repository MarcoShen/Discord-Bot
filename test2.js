const axios = require ('axios');
const fs = require('fs');
const { get } = require('http');
const Discord = require('discord.js');
const moment = require ('moment');
const { beatmap } = require('ojsama');
const { join } = require('path');
const { Console } = require('console');

const USERS = ['Famoose', 'Duckrt', 'MarcoThePotato', 'BingBongNipNong', 'crain', '74-111-110', 'blade100a'];
var methods = {};

methods.check = function(client) {
    var channel = client.channels.cache.get('850516138328981524');
    var now = moment.utc();

    getToken().then(token => {

        // call api to search who is online
        console.log('('+ moment.utc().format() +') Looking for online users...')
        getOnlineUsersData(token).then( map => {
            console.log('('+ moment.utc().format() +') ' + mkey + ' is online');
            map.forEach((value, key) => {

                console.log('('+ moment.utc().format() +') Checking top plays for ' + key)

                // loop thru plays
                for(var i=0; i<value.topPlays.length;i++){

                    var theMap = value.topPlays[i];
                    // top play made in last minute
                    
                    
                    if (now.diff(theMap.created_at, "seconds") < 60){
                        
                        console.log(console.log('('+ moment.utc().format() +') Checking top plays for ' + key + ' made a top play at '+ theMap.created_at));
                        getMaxCombo(token, theMap.beatmap.id).then(mapCombo => {
                            getRankings(token, value.id).then(newRank => {
                                console.log('old rank = ' + value.prevRank)
                                console.log('new rank = ' + newRank.statistics.global_rank)
                                channel.send(makeEmbed(theMap, i+1, mapCombo, now, value.prevRank, newRank.statistics.global_rank, newRank.statistics.pp))
                            })
                        })
                    }

                }
            })

            
        }

        );

        /*checkOnline(token).then(onliners =>{    // api calls every 60 seconds, onliners = 20ish profiles

            // loop thru search result to get onliner
            for(var i=0;i<onliners.length;i++){

                
                // if the user is in the list and online
                if(USERS.includes(onliners[i].username) && onliners[i].is_online){
                    var currI = i;  
                    console.log('('+ now.format() +') CALLING API - Checking top plays for '+ onliners[i].username);   // MarcoThePotato is online
                    
                    
                    // call api to get top 100 plays

                    getTopPlays(token, onliners[i].id).then(top100 => {   
                        
                        
                        // loop thru top 100
                        for(var j=0;j<top100.length;j++){
                            // user made a top play within 1 minute ago
                            if (now.diff(top100[j].created_at, "seconds") < 60){
                                var currJ = j
                                console.log('('+ now.format() +') ' + top100[j].user.username + ' made a top play');

                                
                                // get map combo for embed
                                getMaxCombo(token, top100[j].beatmap.id).then(mapCombo => {

                                    getRankings(token, top100[currJ].user.id).then(newRank => {
                                        channel.send(makeEmbed(top100[currJ], currJ+1, mapCombo, now, 0, newRank.statistics.global_rank, newRank.statistics.pp))
                                    })
                                })
                            }
                            
                        }
                    })

                }
            }
        })*/
    }).catch(err => console.log(err));
    
}

function makeEmbed(data, place, mapCombo, now, prevRank, newRank, newPP){

    console.log(data)
    

    var rank = "?";
    switch(data.rank){
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

    var displayHits = '[' + data.statistics.count_300 + '/'+ data.statistics.count_100 + '/' + data.statistics.count_50 + '/' + data.statistics.count_miss + ']';
    var mods = '';
    if (data.mods.length > 0){
        mods = '+**' + data.mods.join('') + '**';
    }


    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('New #' + place + ' for ' + data.user.username, data.user.avatar_url, 'https://osu.ppy.sh/users/' + data.user.id)
        .setTitle(data.beatmapset.artist + ' - ' + data.beatmapset.title + ' [' + data.beatmap.version + ']')
        .setURL(data.beatmap.url)
        .setDescription(
            rank + '(**' + data.beatmap.difficulty_rating + ' ★**) ' + mods + ' ▸ x' + data.max_combo + '/' + mapCombo + ' ▸ ' + displayHits +  
            '\n```fix\n'+data.pp.toFixed(2) + 'pp for ' + (data.accuracy *100).toFixed(2) + '%'+'```' +
            'Ranking: #' + prevRank + ' -> #**' + newRank + '**'
        )
        .setImage(data.beatmapset.covers.cover)
        .setFooter('played ' + now.diff(data.created_at, "seconds") + ' seconds ago')
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
        
        for(var i=0;i<results.length;i++){
            if(USERS.includes(results[i].username) && results[i].is_online){
                var user = new User(results[i].username,results[i].id,null,null,null)
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

            axiosArrTopPlays.push(axios.get(API_URL+ '/users/'+ users[i].id +'/scores/best?imode=osu&limit=100', {
                headers: {
                    'Authorization': `Bearer ${t}`
                }
            }));
        }
        
        await axios.all(axiosArrUserInfo).then(axios.spread(function(...responses) {
            for(var i=0;i<responses.length;i++){
                var user = usersMap.get(responses[i].data.username);
                user.prevRank = responses[i].data.statistics.global_rank;
            }
        }));

    }).then(async()  => {
        var axiosArrTopPlays = []
        for(var i=0;i<users.length;i++){    
            axiosArrTopPlays.push(axios.get(API_URL+ '/users/'+ users[i].id +'/scores/best?imode=osu&limit=100', {
                headers: {
                    'Authorization': `Bearer ${t}`
                }
            }));
        }
        

        await setTimeoutPromise(60000);
        
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
    constructor(username, id, topPlays, prevRank, newRank){
        this.username = username;
        this.id = id;
        this.topPlays = topPlays;
        this.prevRank = prevRank;
        this.newRank = newRank;
    }
}


exports.methods = methods