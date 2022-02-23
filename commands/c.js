const Discord = require('discord.js');
const general = require('../methods/general.js')
const osu = require('../methods/osu.js')
const moment = require ('moment');

module.exports = {
    name: 'c',
    description: "osu",
    execute(message){

        // get discord speaker's linked profiles
        let speakerInfo = general.methods.getSpeakerData(message);

        let targetBeatmap = osu.methods.getLatestBeatmap();

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
    let score = data.score;
    let arrow = ' ▸ ';
    let mods = osu.methods.emMods(score.mods);
    let rank = osu.methods.emRank(score.rank);
    let hits = osu.methods.emHits(score.statistics);
    let length = osu.methods.emLength(set.total_length, mods);
    let bpm = osu.methods.emBpm(set.bpm, mods);
    let info = arrow + score.score + arrow + length + arrow + bpm;
    let pp = score.pp.toFixed(2);
    let acc = (score.accuracy*100).toFixed(2);

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

