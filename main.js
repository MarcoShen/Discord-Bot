const Discord = require('discord.js');

const client = new Discord.Client();

const prefix = '.';

const fs = require('fs');
const { join } = require('path');


client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log("bot is up");
    client.user.setPresence({
        activity: {
            name: `Hentai`,
            type: "WATCHING"
        }
    })
});



client.on('message',message =>{
    const sauce = client.channels.cache.find(channel => channel.id === '831736012052627486');
    // osu central
    const output = client.channels.cache.find(channel => channel.id === '783044845555941406');
    // not messican
    const output1 = client.channels.cache.find(channel => channel.id === '705513009245847624');
    // val
    const output2 = client.channels.cache.find(channel => channel.id === '770844089746063371');
    
    if (message.channel.id === '831736012052627486'){
        output.send(message.attachments.first().url);
        output1.send(message.attachments.first().url);
    }

    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if(command === 'neko')
        client.commands.get('neko').execute(message,args);
    else if(command == 'riotid')
        client.commands.get('riotid').execute(message,args);
    else if(command == 'stats')
        client.commands.get('stats').execute(message,args);
    else if(command == 'game')
        client.commands.get('game').execute(message,args, client);
    
});





client.login('ODMxNzI3MjY0MzMxODU3OTYz.YHZcYA.t-HKNeL-URcRNpv6DGXe3ui0g7M');