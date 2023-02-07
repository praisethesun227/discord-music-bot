import {Command} from "../types/Command";
import {MyClient} from "../types/MyClient";
import {basicMessageCheck} from "../utils/basicMessageCheck";

module.exports = {
    name: 'resume',
    description: 'Resume a paused track',
    async execute (message) {
        basicMessageCheck(message, {fromGuild: true, guildHasAssociatedPlayer: true});

        const client = message.member!.client as MyClient;
        const player = client.players?.get(message.guild!.id)!;

        player.resume();
    }
} as Command