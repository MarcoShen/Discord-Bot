const Discord = require('discord.js');
const general = require('../methods/general.js')
const osu = require('../methods/osu.js')
const moment = require ('moment');

module.exports = {
    name: 'c',
    description: "osu",
    execute(message){

        // get discord speaker's linked profiles
        var speakerInfo = general.methods.getSpeakerData(message);
        if(speakerInfo == -1) return message.channel.send('Discord user is not in database.')

        var targetBeatmap = osu.methods.getLatestBeatmap();

        osu.methods.getUserBeatmapScore(targetBeatmap, speakerInfo.osuID).then( score => {
            osu.methods.getBeatmapSet(targetBeatmap).then( set => {
                message.channel.send(makeEmbed(score, set));
            })
        }).catch(err =>{
            message.channel.send('you anit played no this map owo')
        })
        
    }
}

function makeEmbed(data,set){

    // variables for the embed
    var score = data.score;
    var arrow = ' ▸ ';
    var mods = osu.methods.emMods(score.mods);
    var rank = osu.methods.emRank(score.rank);
    var hits = osu.methods.emHits(score.statistics);
    var length = osu.methods.emLength(set.total_length, mods);
    var bpm = osu.methods.emBpm(set.bpm, mods);
    var info = arrow + score.score + arrow + length + arrow + bpm;
    var pp = score.pp.toFixed(2);
    var acc = (score.accuracy*100).toFixed(2);

    // embed
    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(set.beatmapset.title + ' [' + set.version + '] ' + mods + ' [' + set.difficulty_rating + '★]',score.user.avatar_url, set.url )
        .setThumbnail(set.beatmapset.covers.list)
        .setTitle('Map Global Rank: #' + data.position)
        .setURL('https://osu.ppy.sh/scores/osu/' + score.id)
        .addFields({
            name: rank + arrow + score.max_combo + '/' + set.max_combo + arrow + hits ,
            value:  '```fix\n' + pp + 'pp ▸ '+ acc + '%\n```' + info +
            arrow + '<t:' + moment(score.created_at).unix() + ':R>'
            //inline: true
        })
        //.setFooter('Score set ' + moment.utc().diff(score.created_at, "days") + ' days ago')
        ;

    return embed;
}

