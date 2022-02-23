const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');
const { MessageAttachment, MessageEmbed } = require('discord.js');


module.exports = {
    name: 'marcoMusic',
    description: "media",
    async execute(message, args){
        const voiceChannel = message.member.voice.channel;
 
        if (!voiceChannel) return message.channel.send('You need to be in a channel to execute this command!');
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send('You dont have the correct permissins');
        if (!permissions.has('SPEAK')) return message.channel.send('You dont have the correct permissins');

        
        const  connection = await voiceChannel.join();
        play(connection, true, message);
    }
}

function play(connection, firstSong, message){
    var files = fs.readdirSync('assets/music/');
    var song = files[Math.floor(Math.random()*files.length)];

    (async () => {
        try {
          const metadata = await mm.parseFile('assets/music/' + song);
          data = metadata.common;
        } catch (error) {
          console.error(error.message);
        }

        message.channel.send(makeEmbed(data.title, data.artists, data.album, data.picture));
        

    })();

    connection.play('assets/music//' + song, {seek: 0, volume: 0.3})
    .on('finish', () =>{
        play(connection,false);
    });
}

function makeEmbed(title, artist, anime, pic){
    

    const Embed = new MessageEmbed()    
	.setColor('#0099ff')
	.setTitle(title)
	.setThumbnail()
    .addFields(
		{ name: 'Artist: ', value: '`' + artist + '`', inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
		{ name: 'Anime: ', value: '`' + anime + '`' },
	)
	.setFooter('.stop to stop');

    return Embed;
}