const fs = require('fs');


let methods = {};

methods.getSpeakerData = function(message) {
    let profiles = fs.readFileSync('assets/profiles.json');
    profiles = JSON.parse(profiles);
    if(profiles.hasOwnProperty(message.member.id)){
        return profiles[message.member.id];
    }
    return null;
}


exports.methods = methods