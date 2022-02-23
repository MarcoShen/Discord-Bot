const { SystemChannelFlags } = require("discord.js");

module.exports = {
    name: 'imperial',
    description: "imperal units and matrix units conversion",
    execute(message){
        if(message.author.bot || message.content.length < 2) return;
        let words = message.content.split(" ")
        
        for(let i=0;i<words.length;i++){
            let noLastChar = words[i].substring(0,words[i].length -1)
            let lastChar = words[i].charAt(words[i].length-1);
            if(validate(lastChar, noLastChar)){
                if(lastChar == 'F' || lastChar == 'f'){
                    console.log(words[i] + " = " + FtoC(noLastChar) + "c");
                    message.channel.send(words[i] + " = " + FtoC(noLastChar) + "c");
                }else{
                    console.log(words[i] + " = " + CtoF(noLastChar) + "f");
                    message.channel.send(words[i] + " = " + CtoF(noLastChar) + "f");
                }
            }        
        }   
    }
}

function validate(lastChar, noLastChar){
    if(!isNaN(noLastChar) && noLastChar > -1000 && noLastChar < 1000 && noLastChar.length > 0){
        if(lastChar == 'F' || lastChar == 'f' || lastChar == 'C' || lastChar == 'c'){
            return true;
        }
    }
    return false;
}

function CtoF(c){
    return Math.round((c/5*9) + 32);
}

function FtoC(f){
    return Math.round((f-32) * 5 / 9);
}
