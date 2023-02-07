import {Command} from "../types/Command";
import {MyClient} from "../types/MyClient";
import {basicMessageCheck} from "../utils/basicMessageCheck";

module.exports = {
    name: 'pause',
    description: 'Pause a track to resume it further',
    async execute (message) {
        basicMessageCheck(message, {fromGuild: true, guildHasAssociatedPlayer: true});

        const client = message.member!.client as MyClient;
        const player = client.players?.get(message.guild!.id)!;

        player.pause();
    }
} as Command