const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

module.exports = {
    name: 'stop',
    description: "media",
    async execute(message, args){

        const voiceChannel = message.member.voice.channel;
        await voiceChannel.leave();
        
    }
}