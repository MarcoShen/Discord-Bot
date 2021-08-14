const { Channel } = require('discord.js');
const moment = require ('moment');

module.exports = {
    name: 'hutao',
    description: "hutao",
    execute(message, args, client){
        var time = moment("2021-10-31 19:00:00");
        var days = time.diff(moment(), 'days');
        var hours = time.diff(moment(), 'hours');
        var mins = time.diff(moment(), 'minutes');
        mins = mins%60;
        hours = hours%24;

        message.channel.send("She aint coming back");

        /*if(hours >= 0){
            if(days > 0){
                message.channel.send("A simp said Hu Tao is coming in " + days + " days and " + hours + " hours!");
                console.log("1");
            }else{
                message.channel.send("A simp said Hu Tao is coming in " + hours + " hours and " + mins + " minutes!");
                console.log("2");
            }
            
        }else{
            if(days < -2){
                message.channel.send("A simp said Hu Tao is coming in " + hours*-1 + " hours and " + mins*-1 + " minutes!");
                console.log("3");
            }else{
                message.channel.send("A simp said Hu Tao is coming in " + days*-1 + " days and " + hours*-1 + " hours!");
                console.log("4");
            }
        }*/
        
    }
}