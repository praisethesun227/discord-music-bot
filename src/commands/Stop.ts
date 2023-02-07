import {Command} from "../types/Command";
import {MyClient} from "../types/MyClient";
import {basicMessageCheck} from "../utils/basicMessageCheck";

module.exports = {
    name: 'stop',
    description: 'Stop and clear the queue',
    async execute (message) {
        basicMessageCheck(message, {fromGuild: true, guildHasAssociatedPlayer: true});

        const client = message.member!.client as MyClient;
        const player = client.players?.get(message.guild!.id)!;

        if (player.currentTrack) {
            player.stop();

            message.reply('Stopped');
        }
    }
} as Command