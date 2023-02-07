import {MyClient} from "../types/MyClient";
import {Command} from "../types/Command";
import {basicMessageCheck} from "../utils/basicMessageCheck";

module.exports = {
    name: 'unloop',
    description: 'Unloop the track/playlist' +
        '\n' +
        '[-p] - unloop the playlist',
    async execute (message) {
        basicMessageCheck(message, {fromGuild: true, guildHasAssociatedPlayer: true});

        const client = message.client as MyClient;
        const player = client.players?.get(message.guildId!);

        if (message.content.includes(' -p'))
            player!.unloopPlaylist();

        else
            player!.unloop();

        message.reply('Done');
    }
} as Command