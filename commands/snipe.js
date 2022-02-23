const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports = {
    name: 'snipe',
    description: "snipe",
    execute(message, args, client){
        if(!message.member.permissions.has("MANAGE_MESSAGES")) return;

        const snipe = client.snipe.get(message.channel.id);
        if(!snipe) return message.channel.send('There\'s nothing to snipe!');

        const index = +args[0] - 1 || 0;
        const target = snipe[index];
        if(!target) return message.channel.send('There is only ' + snipe.length + ' messages!');

        const {msg, time, image} = target;
        if (msg.author.tag == 'MarcoThePotato#2514') return message.channel.send('You can not snipe MarcoThePotato!');

        console.log(msg.content)
        message.channel.send(
            new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
            .setImage(image)
            .setDescription(msg.content)
            .setFooter(`${moment(time).fromNow()}`)
        )
    }
}