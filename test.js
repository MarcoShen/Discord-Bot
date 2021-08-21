var fs = require('fs');

var profiles = fs.readFileSync('assets/profiles.json');
    console.log('test')
    console.log( JSON.parse(profiles));
var methods = {};

methods.getDiscordSpeaker = function(message) {
    
    return message.member.id;
}


exports.methods = methods