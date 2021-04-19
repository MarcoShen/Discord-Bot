const axios = require ('axios');
const Discord = require('discord.js');

module.exports = {
    name: 'stats',
    description: "valorant stats",
    execute(message, args){
        
        // get discord linked profile
        var discID = message.member.id;
        var list = readProfile();

        // get pinged user's profile
        if(args[0]){
            try{
                discID = message.mentions.users.first().id;
            }catch(err){
                message.channel.send("Invalid argument.");
                return;
            }
        }

        // found the discord ID in the list
        if(list.hasOwnProperty(discID)){

            var rTag = list[discID].riotID;
            const id = rTag.split('#');
            

            // player ranking info
            (async () => {
                var pdata = await fetchRR(list[discID].valRegion, id);
                var tier = pdata.data.current_data.currenttier;
                var rank = pdata.data.current_data.currenttierpatched;
                var rr = pdata.data.current_data.ranking_in_tier;

                (async()=>{
                    var mdata = await fetchMI(list[discID].valRegion, id);
                    var analyzed = analyzeData(mdata.data.matches, id);
                    var avatar = message.author.avatarURL();

                    // put into an discord embed message
                    var embed = embedData(analyzed, tier, rank, rr, rTag, avatar);
                    
                    // rank image
                    message.channel.send({
                        embed,
                        files: [{
                            attachment:'assets/ranks/'+ tier +'.png',
                            name:'image.png'
                        }]
                    });

                })() 
            })()
        }else
            message.channel.send("Your discord is not linked to any riot ID.");
    }
}



// Functions

function readProfile(){
    var fs = require('fs');
    var data = fs.readFileSync('assets/profiles.json');
    return JSON.parse(data);
}


async function fetchRR(valRegion, id) {
    try {
      const response = await axios.get('https://api.henrikdev.xyz/valorant/v2/mmr/' + valRegion + '/'+ id[0] + '/' + id[1])
      .then(response => response.data);

      return(response);
    } catch (error) {
      console.error(error);
    }
}

async function fetchMI(valRegion, id){
    try {
        const response = await axios.get('https://api.henrikdev.xyz/valorant/v3/matches/' + valRegion + '/'+ id[0] + '/' + id[1])
        .then(response => response.data);
        return(response);

      } catch (error) {
        console.error(error);
      }
}

function error(){
    message.channel.send("Unable to fetch data.");
}

function analyzeData(matches, id){
    var compsPlayed = 0;
    var roundsPlayed = 0;
    var kills = 0;
    var deaths = 0;
    var damage = 0;
    var won = 0;
    var controller = 0;
    var sentinel = 0;
    var duelist = 0;
    var initiator = 0;

    for(var i=0;i<matches.length;i++){
        if(matches[i].metadata.mode == "Competitive"){
            compsPlayed++;
            roundsPlayed+= matches[i].metadata.rounds_played;
            var team = "";

            for(var j=0;j<matches[i].players.all_players.length;j++){
                if(matches[i].players.all_players[j].name.toLowerCase() == id[0].toLowerCase()){
                    
                    kills += matches[i].players.all_players[j].stats.kills;
                    deaths += matches[i].players.all_players[j].stats.deaths;
                    damage += matches[i].players.all_players[j].damage_made;

                    if(matches[i].players.all_players[j].character == "Sage" ||
                        matches[i].players.all_players[j].character == "Killjoy" ||
                        matches[i].players.all_players[j].character == "Cypher"
                    ){
                        sentinel++;
                    }else if(matches[i].players.all_players[j].character == "Brimstone" ||
                        matches[i].players.all_players[j].character == "Astra" ||
                        matches[i].players.all_players[j].character == "Viper" ||
                        matches[i].players.all_players[j].character == "Omen"
                    ){
                        controller++;
                    }else if(matches[i].players.all_players[j].character == "Jett" ||
                        matches[i].players.all_players[j].character == "Yoru" ||
                        matches[i].players.all_players[j].character == "Phoenix" ||
                        matches[i].players.all_players[j].character == "Raze" ||
                        matches[i].players.all_players[j].character == "Reyna"
                    ){
                        duelist++;
                    }else if(matches[i].players.all_players[j].character == "Breach" ||
                        matches[i].players.all_players[j].character == "Sova" ||
                        matches[i].players.all_players[j].character == "Skye"
                    ){
                        initiator++;
                    }


                    if(team == ""){
                        team = matches[i].players.all_players[j].team;
                        team = team.toLowerCase();
                    }


                }

            }    

            if(team == 'blue' && matches[i].teams.blue.has_won){
                won++;
            }else if (team == 'red' && matches[i].teams.red.has_won){
                won++;
            }
                
        }
        
    }

    // conversion
    var kd = kills/deaths;
    kd = kd.toFixed(2);
    var adr = damage/roundsPlayed;
    adr = adr.toFixed(0);
    var wr = (won/compsPlayed) *100 + "%";
    var kr = kills/roundsPlayed;
    kr = kr.toFixed(2);
    var kg = kills/compsPlayed;
    kg = kg.toFixed(0)

    return [compsPlayed, kd, adr, wr, kr, kg, controller, sentinel, duelist, initiator];

}

function embedData(analyzed, tier, rank, rr, rTag, avatar){
    var compsPlayed = analyzed[0];
    var kd = analyzed[1];
    var adr = analyzed[2];
    var wr = analyzed[3];
    var kr = analyzed[4];
    var kg = analyzed[5]
    var controller = analyzed[6];
    var sentinel = analyzed[7];
    var duelist = analyzed[8]
    var initiator = analyzed[9];


    if(tier < 21)
        rr = rr + "/100";

    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle("Rank: " + rank)
        .setAuthor(rTag,avatar)
        .setThumbnail('attachment://image.png')

        .addFields(
            { name: "RR: " + rr, value: "\n\u200b", inline: true },
            { name: "\n\u200b", value: "__Last " + compsPlayed + " Matches__", inline: true },
            { name: "\n\u200b", value: "\n\u200b", inline: true },
        )

        .addFields(
            { name: wr, value: "Win Rate", inline: true },
            { name: kg + " / "+ + adr + "", value: "Kills / ADR", inline: true },
            { name: kd + " / " + kr , value: "KD / KR", inline: true },
        )

        .addFields(
            { name: "Duelist: " + duelist, value: "**Controller: " + controller+ "**", inline: true },
            { name: "\n\u200b", value: "\n\u200b", inline: true },
            { name: "Initiator: " + initiator, value: "**Sentinel: " + sentinel + "**", inline: true },
        );
    
    return embed;
}
