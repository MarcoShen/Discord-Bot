const osu = require('../methods/osu.js')
const Discord = require('discord.js');
const moment = require ('moment');

module.exports = {
    name: 'rs',
    description: "osu",
    execute(message, args){

        let targetUser = osu.methods.getTargetUser(message, args);
        if(targetUser == null) return message.channel.send("You are not linked to any osu account.")

        osu.methods.getUser(targetUser).then( user => {
            osu.methods.getRecentScore(user.id).then( score => {
                if(score.length == 0) return message.channel.send('`' + user.username + '` has no recent plays.')

                let betamapID = score[0].beatmap.id;
                osu.methods.getBeatmapSet(betamapID).then( beatmapSet => {
                    osu.methods.getMapData(betamapID).then( mapData => {
                        osu.methods.setLatestBeatMap(betamapID);

                        let playData = new osu.playData(score[0],beatmapSet, mapData);
                        message.channel.send(makeEmbed(playData));
                    })
                    
                });
            });
        }).catch(err =>{
            return message.channel.send('User `' + targetUser + '` was not found.');
        });
    }
}

function makeEmbed(playData){
    let arrow = ' ▸ ';
    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(playData.mapTitle + playData.mods + playData.stars, playData.avatar, playData.mapURL)
        .setThumbnail(playData.thumbnail)
        .addFields({
            name: playData.rank + arrow + playData.combo + arrow + playData.hits,
            value: '```fix\n' + playData.pp + arrow + playData.acc + '```' + playData.mapInfo,
            inline: true
        },{
            name: playData.chokeTitle,
            value: playData.chokeValue,
            inline: true
        })
        .setFooter(playData.whatIf);
        
    return embed;
}
