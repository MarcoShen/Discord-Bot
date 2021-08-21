const axios = require ('axios');
const Discord = require('discord.js');

module.exports = {
    name: 'top',
    description: "osu",
    execute(message, args, client){

        // get osu ID
        var discID = message.member.id;
        var list = readProfile();
        var user;

        // get user
        var user;
        

        getToken().then(token => {
            if(args){
                getUserID(token, args[0]).then(id => {
                    user = id;
                    main(token, user, message);
                })
                .catch(err => console.log(err));
            }else{
                if(list.hasOwnProperty(discID)){
                    user = list[discID].osuID;
                    main(token, user, message);
                }else{
                    message.channel.send("osu not linked.");
                    return;
                }
            }
        }).catch(err => console.log(err));
                
    }
}


function main(token, user, message){
    top(token, user).then(data => {
        console.log(data)
    })
}



function getUserID(t, user){
    const promise = axios.get(API_URL+ '/users/'+user+'/osu?key=account_history', {
        headers: {
            'Authorization': `Bearer ${t}`
        }
        })
    const dataPromise = promise.then((response) => response.data.id)
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

function top(t, user){
    const promise = axios.get(API_URL+ '/users/'+ user +'/scores/best?include_fails=1&mode=osu&limit=5', {
    headers: {
        'Authorization': `Bearer ${t}`
    }
    })
    const dataPromise = promise.then((response) => response.data)
    return dataPromise
}



function readProfile(){
    var fs = require('fs');
    var data = fs.readFileSync('assets/profiles.json');
    return JSON.parse(data);
}





