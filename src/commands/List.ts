import {MyClient} from "../types/MyClient";
import {Command} from "../types/Command";
import {convertSecsToMinsAndSecs} from "../utils/convertSecsToMinsAndSecs";
import {basicMessageCheck} from "../utils/basicMessageCheck";

module.exports = {
    name: 'list',
    description: 'List queued tracks',

    async execute (message) {
        basicMessageCheck(message, {fromGuild: true, guildHasAssociatedPlayer: true});

        const client = message.member!.client as MyClient;
        const player = client.players?.get(message.guild!.id)!;

        const queue = player.guildSongsQueue;
        const trackPointer = player.trackPointer;

        let reply = '';
        let overallDuration = 0;
        let played = 0;

        for (let i = 0; i < queue.length; i++) {
            overallDuration += queue[i].durationInSec;
            if (i === trackPointer) {
                reply += `-----> ${i + 1}. ${queue[i].title} - ${queue[i].durationRaw} <-----\n`;
            }
            else {
                if (i < trackPointer) played += queue[i].durationInSec;
                reply += `${i + 1}. ${queue[i].title} - ${queue[i].durationRaw}\n`;
            }
        }

        let overallDurationString = convertSecsToMinsAndSecs(overallDuration);
        let playedString = convertSecsToMinsAndSecs(played);
        let playbackLeftString = convertSecsToMinsAndSecs(overallDuration - played);

        if (reply)
            message.reply(`${reply}\n\nPlaylist length: ${overallDurationString}`);
    }
} as Command