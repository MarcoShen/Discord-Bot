const axios = require ('axios');
const fs = require('fs');

module.exports = {
    name: 'addval',
    description: "add valorant id",
    execute(message, args){
        if(!args[0] || args[1]){
            return (message.channel.send("Invalid argument, usage: .addval <name#tag>"));
        }

        let id = args[0].replace("#","/")
        axios.get('https://api.henrikdev.xyz/valorant/v1/mmr/na/' + id).then(response => {
            if(response.data.status == 200){
                addToList(message.guild.id, id, message)
            }
        }).catch(err =>{
            return message.channel.send('Unable to add user, please try again later.');
        });

    }
}

function addToList(serverID, riotId, message){
    let file = fs.readFileSync('assets/riotid.json');
    let json = JSON.parse(file)
    for (var key in json) {
        if(key == serverID){
            if(json[key].includes(riotId)){
                message.channel.send("User is already in the database.");
                return;
            }
            json[key].push(riotId);
        }
    }
    addToFile(json, message);
    
}

function addToFile(json, message){
    json = JSON.stringify(json);
    fs.writeFile("assets/riotid.json", json, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
        message.channel.send("User have been added to the database.")
    });
}