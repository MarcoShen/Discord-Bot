module.exports = {
    name: 'help',
    description: "valorant game",
    execute(message, args, client){
        message.channel.send("Commands: ``.add`` ``.ranks``, ``.ranks``");
    }
}