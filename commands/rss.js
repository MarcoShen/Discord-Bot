const osu = require('../methods/osu.js')
const general = require('../methods/general.js')

module.exports = {
    name: 'rss',
    description: "osu",
    execute(message, args){

        var userID = general.methods.getSpeakerData(message).osuID;
        if(userID == null) return message.channel.send("You are not linked to any osu account.")

        if(args[0]){
            userID = osu.methods.getUserID(args[0]).then(id =>{
                console.log(id)
            });
        }

        console.log(userID)
    }
        
}