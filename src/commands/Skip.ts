import {MyClient} from "../types/MyClient";
import {Command} from "../types/Command";
import {basicMessageCheck} from "../utils/basicMessageCheck";

module.exports = {
    name: 'skip',
    description: 'Skip to the next track in the queue',

    async execute (message) {
        basicMessageCheck(message, {fromGuild: true, guildHasAssociatedPlayer: true});

        const client = message.member!.client as MyClient;
        const player = client.players?.get(message.guild!.id)!;

        const tracks = await player.skip();

        message.reply(`Skipped:\n${tracks[0]}\n\nNext:\n${tracks[1]}`);
    }
} as Command