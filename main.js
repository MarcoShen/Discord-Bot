const Discord = require('discord.js');

const client = new Discord.Client();
const moment = require ('moment');

const checkTopPlays = require('./commands/checkTopPlays.js')
const config = require('./methods/config.js')
const prefix = '.';
const fs = require('fs');
// MEDIA


// load commands
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// on start up
client.once('ready', () => {
    console.log("bot is up");
    client.user.setPresence({
        activity: {
            name: config.methods.getActivity().activity_name,
            type: config.methods.getActivity().activity_type
        }
    })

    // loop every miniute
    checkTopPlays.methods.check(client);
    setInterval(function() {
        checkTopPlays.methods.check(client);
    }, 60 * 1000); // 60 * 1000 milsec
});

// on MessageDelete Event
client.snipe = new Discord.Collection();
client.on('messageDelete', (message) => {
    let snipe = client.snipe.get(message.channel.id) || [];
    if (snipe.length > 10) snipe.slice(0,9);

    snipe.unshift({
        msg: message,
        image: message.attachments.first()?.proxyURL || null,
        time: Date.now(),
    });

    client.snipe.set(message.channel.id, snipe);
})

// on Message Event
client.on('message', async message =>{
    client.commands.get('imperial').execute(message);

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

    //spark is sus
    if (message.channel.id === '783044845555941406' && message.member.id === '112380350591766528' ){
        if (message.attachments.size > 0) {
            client.commands.get('neko').execute(message,"3");
        }
    }

    if(message.content == "stfu" && message.channel.id === '792283920690577438'){
	    imageNumber = Math.floor (Math.random()*(7 - 1 + 1))+1;
        message.channel.send( {files: ["assets/stfu" + imageNumber + ".png"]});    
    }

    let colour = ['brown','brown','brown','brown','brown','brown','brown','brown','brown','brown', 'greenish', 'very green', 'black', 'pale', 'red', 'yellow'];
    let shape = ['marbles', 'caterpillar', 'hot dogs', 'snake', 'amoebas', 'mushy', 'watery'];
    let size = ['beefy', 'big', 'bulky', 'cubby', 'epic', 'fat', 'gigantic', 'heavy', 'immense', 'large', 'massive','mini', 'plump', 'minuscule', 'slim', 'small', 'tiny', 'titanic'];
    let lastPoop = 0;

    if(message.content == "poop" && message.member.id === '280103793428004864'){
        message.channel.send("You pooped some " + size[randomize(size.length)] + " " + colour[randomize(colour.length)] + " coloured and " + shape[randomize(shape.length)] + " shaped \:poop:!");
    }

    function randomize(i){
        return Math.floor((Math.random() * i));
    }

    if(message.content == "taco"  && message.member.id === '145905288250130432'){
        message.channel.send("\:taco:")
    }

    if(message.content == "pp"  && message.member.id === '219917365771632641'){
        message.channel.send("\:eggplant:")
    }

    if(message.content == ".karen"  && message.member.id === '724047883032068199'){
        message.channel.send("\:arrow_upper_left: ")
    }

    // commands
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();


    // log command used
    console.log(message.channel.id + ' - ' + message.member.user.tag + ': ' + message.content);

    if(command === 'neko')
        client.commands.get('neko').execute(message,args);
    else if(command == 'addval')
        client.commands.get('addval').execute(message,args);
    else if(command == 'track')
        client.commands.get('track').execute(message,args);
    else if(command == 'rs')
        client.commands.get('rs').execute(message,args);
    //else if(command == 'stats')
       // client.commands.get('stats').execute(message,args);
    else if(command == 'game')
        client.commands.get('game').execute(message,args, client);
    else if(command == 'help')
        client.commands.get('help').execute(message,args, client);
    else if(command == 'ranks')
        client.commands.get('ranks').execute(message,args, client);
    else if(command == 'top')
        client.commands.get('top').execute(message,args, client);
    else if(command == 'c')
        client.commands.get('c').execute(message,args);
    else if(command == 'osu')
        client.commands.get('osuProfile').execute(message,args);
    else if(command == 'mexican')
        message.channel.send( {files: ["assets/mexican.png"]});
    else if(command == 'jews')
        message.channel.send( {files: ["assets/jew.png"]});
    else if(command == 'snipe' || command == 's')
        client.commands.get('snipe').execute(message,args, client);
    else if(command == 'mal')
        client.commands.get('mal').execute(message,args);
    else if(command === 'play')
        client.commands.get('play').execute(message,args);
    else if(command === 'stop')
        client.commands.get('stop').execute(message,args);
    else if(command === 'marcomusic')
        client.commands.get('marcoMusic').execute(message,args);
});






client.login(config.methods.getDiscordKey());


