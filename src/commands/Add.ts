import {Command} from "../types/Command";
import {MyClient} from "../types/MyClient";
import {getTracks} from "../utils/getTracks";
import {prefix} from "../../config.json";
import {basicMessageCheck} from "../utils/basicMessageCheck";

module.exports = {
    name: 'add',
    description: 'Add a song to the queue',
    async execute (message) {
        basicMessageCheck(message, {fromGuild: true, guildHasAssociatedPlayer: true});

        const client = message.member!.client as MyClient;
        const player = client.players?.get(message.guild!.id)!;

        const result = await getTracks(message.content.slice(prefix.length + this.name.length));
        if (!result) return message.reply('Not found');
        const track = result[0];

        player.addToQueue(track);

        message.reply(`Added to the queue:\n${player.guildSongsQueue.length}. ${track.title}\nDuration: ${track.durationRaw}`);
    }
} as Command