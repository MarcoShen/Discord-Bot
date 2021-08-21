const osu = require('../methods/osu.js')
const Discord = require('discord.js');
const moment = require ('moment');

module.exports = {
    name: 'rs',
    description: "osu",
    execute(message, args){

        let targetUser = osu.methods.getTargetUser(message, args);
        if(targetUser == null) return message.channel.send("You are not linked to any osu account.")

        osu.methods.getUser(targetUser).then( user => {
            osu.methods.getRecentScore(user.id).then( score => {
                if(score.length == 0) return message.channel.send('`' + user.username + '` has no recent plays.')
                osu.methods.getBeatmapSet(score[0].beatmap.id).then( beatmapSet => {
                    osu.methods.getMapData(score[0].beatmap.id).then( mapData => {
                        message.channel.send(makeEmbed(score[0], beatmapSet, mapData))
                    })
                    
                });
            });
        }).catch(err =>{
            return message.channel.send('User `' + targetUser + '` was not found.');
        });
    }
}

function makeEmbed(score, set, mapData){
    // variables for the embed
    let arrow = ' ▸ ';
    let mods = osu.methods.emMods(score.mods);
    let rank = osu.methods.emRank(score.rank);
    let hits = osu.methods.emHits(score.statistics);
    let length = osu.methods.emLength(set.total_length, mods);
    let bpm = osu.methods.emBpm(set.bpm, mods);
    let info = arrow + score.score + arrow + length + arrow + bpm;
    let acc = (score.accuracy*100).toFixed(2);
    let time = '';

    let pp = score.pp;
    if(score.pp == null){
        pp = osu.methods.getPP(mapData, score.mods, acc, score.max_combo, score.statistics.count_miss)
    }

    let noChokeTitle, noChokeValue = '\u200B';
    if(!score.perfect){ 
        let noChokeAcc = osu.methods.getNoChokeAcc(score.statistics, set.count_circles, set.count_sliders, set.count_spinners, score.passed);
        let noChokePP = osu.methods.getPP(mapData, score.mods, noChokeAcc, set.max_combo, 0)
        noChokeTitle = "<:__:877033717166661632>"
        noChokeValue = '```yaml\n' + noChokePP + 'pp ▸ ' + noChokeAcc + '%\n```'+ arrow +'<t:' + moment(score.created_at).unix() + ':R>';
    }else{
        time = arrow + '<t:' + moment(score.created_at).unix() + ':R>'
    }

    let whatIf = osu.methods.getWhatIf(mapData, score.mods, set.max_combo)

    // embed
    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor(set.beatmapset.artist + ' - ' + set.beatmapset.title + ' [' + set.version + ']\n ' + mods + ' [' + set.difficulty_rating + '★]',score.user.avatar_url, set.url )
        .setThumbnail(set.beatmapset.covers.list)
        .setURL('https://osu.ppy.sh/scores/osu/' + score.id)
        .addFields({
            name: rank + arrow + score.max_combo + '/' + set.max_combo + arrow + hits ,
            value:  '```fix\n' + pp + 'pp ▸ '+ acc + '%\n```' + info + time,
            inline: true
        },{
            name: noChokeTitle,
            value: noChokeValue,
            inline: true
        })
        .setFooter('95% ' + whatIf[0] + 'pp | 98% ' + whatIf[1] + 'pp | 99% ' + whatIf[2] + 'pp | 100% ' + whatIf[3] + 'pp');

    return embed;
}