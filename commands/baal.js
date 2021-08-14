const { Channel } = require('discord.js');
const moment = require ('moment');

module.exports = {
    name: 'baal',
    description: "baal",
    execute(message, args, client){
        var time = moment("2021-09-01 23:00:00");
        var days = time.diff(moment(), 'days');
        var hours = time.diff(moment(), 'hours');
        var mins = time.diff(moment(), 'minutes');
        mins = mins%60;
        hours = hours%24;

        if(hours >= 0){
            if(days > 0){
                message.channel.send("Baal is coming out in " + days + " days and " + hours + " hours!");
                console.log("1");
            }else{
                message.channel.send("Baal is coming out in " + hours + " hours and " + mins + " minutes!");
                console.log("2");
            }
            
        }else{
            if(days < -2){
                message.channel.send("Baal was out for " + hours*-1 + " hours and " + mins*-1 + " minutes!");
                console.log("3");
            }else{
                message.channel.send("Baal was out for " + days*-1 + " days and " + hours*-1 + " hours!");
                console.log("4");
            }
        }
        
    }
}