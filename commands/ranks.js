const axios = require ('axios');
const Discord = require('discord.js');

module.exports = {
    name: 'ranks',
    description: "ranks",
    execute(message, args){

        // player ranking info
        (async () => {
            var pdata = await fetchRR();
            console.log(pdata);
        })()
    }
}

async function fetchRR() {
    try {
      const response = [];
      response[0]= await axios.get('https://api.henrikdev.xyz/valorant/v2/mmr/na/Famoose/iwnl')
      response[1]= await axios.get('https://api.henrikdev.xyz/valorant/v2/mmr/na/MarcoThePotato/2514')
      .then(response => response[0].data);

      return(response);
    } catch (error) {
      console.error(error);
    }
}