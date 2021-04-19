module.exports = {
    name: 'riotid',
    description: "save riot id",
    execute(message, args){

        var fs = require('fs');
        var data = fs.readFileSync('assets/profiles.json');
        var list = JSON.parse(data);
        var discID = message.member.id;
        
            


        if(!args[0]){
            if(list.hasOwnProperty(discID))
                message.channel.send("Your discord is linked already to: " + list[discID].riotID);
            else
                message.channel.send("Your discord is not linked to any riot ID.");
            return;

        }else{
            var riotTag = "";
            for(var i=0; i<args.length;i++){
                riotTag += args[i];
                if(i!=args.length-1)
                    riotTag += " ";
            }

            if(riotTag.length < 30){
                if(list.hasOwnProperty(discID)){
                    list[discID].riotID = riotTag;
                    list[discID].valRegion = "na";
                }
                else{
                    list[discID] = {"discordTag": message.member.user.tag,"riotID": riotTag, "valRegion": "na"};
                }
                message.channel.send("Your discord is now linked to: " + list[discID].riotID);
            }else{
                message.channel.send("Your riot ID is too long.");
            }
        }

        var stringified = JSON.stringify(list, null, 2);
        fs.writeFile('assets/profiles.json', stringified, wrote); 

    }

    
}

function wrote(){
    console.log("Wrote new data to profiles.json");
}