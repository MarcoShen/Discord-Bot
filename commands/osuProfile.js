const osu = require('../methods/osu.js')
const graph = require('../methods/graph.js')
const Discord = require('discord.js');
const moment = require ('moment');


module.exports = {
    name: 'osuProfile',
    description: "osu",
    execute(message, args){
        
        let targetUser = osu.methods.getTargetUser(message, args);
        if(targetUser == null) return message.channel.send('Your discord is not linked to any osu account');

        osu.methods.getUser(targetUser).then( user => {
            graph.methods.getOsuRank(user.rankHistory.data).then( url => {
                let userData = new osu.userData(user);
                message.channel.send(makeEmbed(userData, url));
            })
        })

    }
}

function makeEmbed(userData, url){
    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(userData.username + '\'s osu profile', userData.flag, userData.profileURL)
        .setThumbnail(userData.avatar)
        .addFields({
            name: 'Global:',
            value: '#' + userData.globalRank,
            inline: true
        },{
            name: 'Country:',
            value: '#' + userData.countryRank + ' (' + userData.country + ')',
            inline: true
        },{
            name: 'Level:',
            value: userData.level + '+' + userData.progress + '%',
            inline: true
        },{
            name: 'Acc:',
            value: userData.acc + '%',
            inline: true
        },{
            name: 'PP:',
            value: userData.pp + 'pp',
            inline: true
        },{
            name: 'Playcount:',
            value: userData.plays + ' (' + userData.playTime + ' hrs)',
            inline: true
        },{
            name: 'Grades:',
            value: osu.methods.emRank('XH') + ': `' + userData.ssh + '` ' + 
            osu.methods.emRank('X') + ': `' + userData.ss + '` ' +
            osu.methods.emRank('SH') + ': `' + userData.sh + '` ' +
            osu.methods.emRank('S') + ': `' + userData.s + '` ' +
            osu.methods.emRank('A') + ': `' + userData.a + '`',
            inline: true
        })
        .setImage(url)
        .setFooter('Joined osu! ' + userData.joinDate)
        
    return embed;
}