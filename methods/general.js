var fs = require('fs');


var methods = {};

methods.getSpeakerData = function(message) {
    var profiles = fs.readFileSync('assets/profiles.json');
    profiles = JSON.parse(profiles);
    if(profiles.hasOwnProperty(message.member.id)){
        return profiles[message.member.id];
    }
    return null;
}


exports.methods = methods