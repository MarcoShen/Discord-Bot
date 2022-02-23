const axios = require ('axios');
const Discord = require('discord.js');
const fs = require('fs');
const { request } = require('http');
const { join } = require('path');

module.exports = {
    name: 'ranks',
    description: "ranks",
    execute(message, args){
  
      let userArr = getUserList(message.guild.id);
      getRank(userArr, message);
    }
}

function getRank(users, message){
  
  const URL = "https://api.henrikdev.xyz/valorant/v1/mmr/na/";
  let requests = [];
  let data = [];

  for(let i=0; i<users.length; i++){
    requests.push(axios.get(URL + users[i]))
  }
  
  axios.all(requests).then(axios.spread((...responses) => {
    for(let i=0; i<responses.length; i++){
      data.push(responses[i].data.data)
    }
    printResult(data, message)
  })).catch(errors => {
    console.log(errors)
    return;
  })
}

function getUserList(serverID){
  let file = fs.readFileSync('assets/riotid.json');
  let json = JSON.parse(file)
  for (var key in json) {
    if(key == serverID)
      return json[key];
  }
}

function printResult(data, message){
  let result = []
  sortByElo(data);
  for(let i=0; i<data.length; i++){
    result.push(tierToEmote(data[i].currenttier) + " `" + data[i].ranking_in_tier + " RR` `" + data[i].name + "` `#" + data[i].tag + "`\n");
  }
  message.channel.send(result.join(''))
}

function tierToEmote(tier){
  let emote = "";
  switch(tier){
    case 3: emote = "<:3_:911838344072298506>"; break;
    case 4: emote = "<:4_:911838344328138762>"; break;
    case 5: emote = "<:5_:911838346853109790>"; break;
    case 6: emote = "<:6_:911838344114221077>"; break;
    case 7: emote = "<:7_:911838346488209418> "; break;
    case 8: emote = "<:8_:911838348249796639> "; break;
    case 9: emote = "<:9_:911838345410252821> "; break;
    case 10: emote = "<:10:911838346903441449> "; break;
    case 11: emote = "<:11:911838348455321600> "; break;
    case 12: emote = "<:12:911838346853101589> "; break;
    case 13: emote = "<:13:911838348635680778> "; break;
    case 14: emote = "<:14:911838348673433661> "; break;
    case 15: emote = "<:15:911838347381579816> "; break;
    case 16: emote = "<:16:911838347591290900> "; break;
    case 17: emote = "<:17:911838348660838470> "; break;
    case 18: emote = "<:18:911838347708751972> "; break;
    case 19: emote = "<:19:911838348740538409> "; break;
    case 20: emote = "<:20:911838348937670697> "; break;
    case 21: emote = "<:21:911838348740546611> "; break;
    case 22: emote = "<:22:911838348849578007> "; break;
    case 23: emote = "<:23:911838349055111168> "; break;
    case 24: emote = "<:24:911838349092864000> "; break;
  }
  return emote;

}

function sortByElo(data){
  for(var i = 0; i < data.length; i++){
     
    // Last i elements are already in place  
    for(var j = 0; j < ( data.length - i -1 ); j++){
        
      // Checking if the item at present iteration 
      // is greater than the next iteration
      if(data[j].elo < data[j+1].elo){
          
        // If the condition is true then swap them
        var temp = data[j]
        data[j] = data[j + 1]
        data[j+1] = temp
      }
    }
  }
  // Print the sorted array
  return data;
}

