const Discord = require('discord.js');

module.exports = {
    name: 'game',
    description: "valorant game",
    execute(message, args, client){
        if(argTask(args) == -1)
            return message.channel.send("Usage: ``.game <start|end|leaderboard>``");
        else if(argTask(args) == 1){
            var data = getData();
            var agent = getAgent();
            var voiceLine = getVoiceLine(data, agent);
            agent = agent.toLowerCase();

            console.log(agent);
            message.channel.send("``"+ voiceLine +"``");

            client.on('message',message =>{
                var winner;
                if(message.content.toLowerCase() == agent){
                    winner = message.author.username;
                }
            });

        }
    }
}

function argTask(a){
    if(!a[0])
        return -1
    else if(a[0] == "start")
        return 1;
    else if(a[0] == "end")
        return 2;
    else if(a[0] == "leaderboard")
        return 3;
    else   
        return -1;
}

function getAgent(){
    
    var agentList = ["Yoru", "Jett", "Phoenix"];
    return agentList[getRndInt(0,agentList.length)];
}

function getVoiceLine(vl, agen){
    var voiceLineChosen = vl[agen][getRndInt(0, vl[agen].length)];
    return voiceLineChosen;
}

function getData(){
    var fs = require('fs');
    var data = fs.readFileSync('assets/voiceline.json');
    var list = JSON.parse(data);
    return list;
}

function getRndInt(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

