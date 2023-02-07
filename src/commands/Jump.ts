import {MyClient} from "../types/MyClient";
import {prefix} from "../../config.json";
import {Command} from "../types/Command";
import {basicMessageCheck} from "../utils/basicMessageCheck";

module.exports = {
    name: 'jump',
    description: 'Jump to the specified position in the queue',
    async execute (message) {
        basicMessageCheck(message, {fromGuild: true, guildHasAssociatedPlayer: true});

        const client = message.member!.client as MyClient;
        const player = client.players?.get(message.guild!.id)!;

        const pos = parseInt(message.content.split(`${prefix}${this.name} `)[1]);

        if (Number.isNaN(pos)) {
            message.reply('Invalid argument');
            return;
        }

        if (await player.jump(pos))
            message.reply('Done');
        else
            message.reply('The number is too small or too big for this queue')
    }
} as Command