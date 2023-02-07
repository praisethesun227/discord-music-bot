import {MyClient} from "../types/MyClient";
import {Command} from "../types/Command";
import {basicMessageCheck} from "../utils/basicMessageCheck";

module.exports = {
    name: 'loop',
    description: 'Loop the track\n' +
        '[-p] - loop the current playlist',

    async execute (message) {
        basicMessageCheck(message, {fromGuild: true, guildHasAssociatedPlayer: true});

        const client = message.member!.client as MyClient;
        const player = client.players?.get(message.guild!.id)!;

        if (message.content.includes(' -p')) {
            player.loopPlaylist();
        }

        else
            player.loop();

        message.reply('Done');
    }
} as Command