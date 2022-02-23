const axios = require ('axios');
const fs = require('fs');
const { DateTime } = require('luxon');
const URL = "https://api.henrikdev.xyz/valorant/v1/mmr/na/";

module.exports = {
    name: 'track',
    description: "rr change checker",
    execute(message, args){
        const serverID = message.guild.id;
        let file = fs.readFileSync('assets/rr.json');
        let json = JSON.parse(file)
        let serverUsers = getSeverUsers(json, serverID);
        console.log(serverUsers)

        //.track 
        if(!args[0]){
            
            if(serverUsers == null){
                return message.channel.send("No users found.")
            }
            track(serverUsers, message, json)
            
        //.track list
        }else if(args[0].toLowerCase() == "list"){
            let stringList = [];
            for (var key in serverUsers) {
                stringList = stringList + key + "\n";
            }
            message.channel.send("```" + stringList + "```");

        //track user#tag
        }else{
            let id = args.join(' ');
            let apiid = id.replace("#","/");
            console.log(URL + apiid)
            axios.get(URL + apiid).then(response => {
                if(response.data.status == 200){
                    serverUsers = addUser(serverUsers, response.data.data);
                    save(json)
                    message.channel.send("User have been added to the database.")
                }
            }).catch(err =>{
                return message.channel.send('Unable to add user, please try again later.');
            });
        }
        

    }
}

function getSeverUsers(json, serverID){
    for (var key in json) {
        if(key == serverID){
            return(json[key]);
        }
    }
    return null;
}

function addUser(serverUsers,data){
    serverUsers[data.name+"#"+data.tag] = data.elo;
    return serverUsers;
}

function save(json){
    json = JSON.stringify(json);
    fs.writeFile("assets/rr.json", json, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
}

function track(serverUsers, message, json){
    let requests = [];
    let playersGain = new Map();
    
    for (var user in serverUsers) {
        user = user.replace("#","/")
        
        if(user != 'LastUpdate'){
            console.log(URL + user);
            requests.push(axios.get(URL + user))
        }
    }
      
    axios.all(requests).then(axios.spread((...responses) => {
        for(let i=0; i<responses.length; i++){
            let playerName = responses[i].data.data.name + "#" + responses[i].data.data.tag
            let cRR = responses[i].data.data.elo;
            let pRR = serverUsers[playerName];
            let netGain = cRR - pRR;
            if(netGain != 0){
                playersGain.set(playerName, netGain)
            }
        }

        let lastUpdate = getLastUpdate(serverUsers);
        if(playersGain.size == 0){
            if(Math.floor(lastUpdate.hours) == 0){
                message.channel.send("No updates since *" + Math.floor(lastUpdate.minutes) + " minutes ago*");
            }else{
                message.channel.send("No updates since *" + Math.floor(lastUpdate.hours)+ " hours " + Math.floor(lastUpdate.minutes) + " minutes ago*");
            }
            return;
        }
        
        updateList(playersGain, serverUsers);
        printResults(playersGain, message, lastUpdate);
        serverUsers.LastUpdate = DateTime.now().toISO();
        save(json);
        

    })).catch(errors => {
        console.log(errors)
        return;
    })
}

function getLastUpdate(serverUsers){
    return DateTime.now().diff(DateTime.fromISO(serverUsers.LastUpdate), ['hours', 'minutes']).toObject();
}

function update(){

}

function updateList(playersGain, serverUsers){
    for (let [key, value] of playersGain) {
        serverUsers[key] = serverUsers[key]+ value;
    }
    return serverUsers;
}

function printResults(playersGain, message, lastUpdate){
    let result = [];
    for (let [key, value] of playersGain) {
        if(value > 0) result.push("`"+key+ "` `+" + value +"rr`\n");
        else result.push("`"+key+ "` `" + value +"rr`\n");
    }
    message.channel.send(result.join(''));
    if(Math.floor(lastUpdate.hours) == 0){
        message.channel.send("Last Updated: *" + Math.floor(lastUpdate.minutes) + " minutes ago*");
    }else{
        message.channel.send("Last Updated: *" + Math.floor(lastUpdate.hours)+ " hours " + Math.floor(lastUpdate.minutes) + " minutes ago*");
    }
}