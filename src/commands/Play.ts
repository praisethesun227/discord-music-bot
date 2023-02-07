import {Command} from "../types/Command";
import {prefix} from '../../config.json';
import {MyClient} from "../types/MyClient";
import {GuildPlayer} from "../types/GuildPlayer";
import {getTracks} from "../utils/getTracks";
import {AudioPlayerStatus} from "@discordjs/voice";
import {basicMessageCheck} from "../utils/basicMessageCheck";
import {SearchOptions} from "play-dl";

module.exports = {
    name: 'play',
    description: 'Play a song/resume playback and add to the queue/add to the queue (youtube)' +
        '\n' +
        '[-p] - find a playlist instead of a single track' +
        '[-sc] - search on SoundCloud',

    async execute(message) {
        basicMessageCheck(message, {fromGuild: true, senderIsInVc: true, permissions: ['Connect', 'Speak']});

        const guild = message.guild!;
        const member = message.member!;
        const vc = member.voice.channel!;

        //get the player associated with the server
        const client = message.client as MyClient;
        const player = client.players?.get(guild.id)!;

        //get the track
        let trackName = message.content.slice(prefix.length + this.name.length);

        let searchOptions: SearchOptions = {};

        let defaultSource: keyof NonNullable<SearchOptions['source']> | undefined;
        let defaultSourceContentType: NonNullable<SearchOptions['source']>['youtube' | 'soundcloud'] | undefined;

        if (trackName.includes(' -sc')) {
            defaultSource = 'soundcloud';
            if (trackName.includes(' -p'))
                defaultSourceContentType = 'playlists';
            else
                defaultSourceContentType = 'tracks';
        }
        else if (trackName.includes(' -p')) {
            defaultSourceContentType = 'playlist';
            defaultSource = 'youtube';
        }

        if (defaultSource && defaultSourceContentType)
            searchOptions = {...searchOptions, source: { [defaultSource]: defaultSourceContentType }};

        trackName = trackName.replace(' -p', '');
        trackName = trackName.replace(' -sc', '');

        const tracks = await getTracks(trackName, {...searchOptions});

        if (!tracks) {
            return message.reply('Not found');
        }

        if (!player) {
            //create a player for the server
            const player = new GuildPlayer(guild, tracks);

            //assosicate the player with the server
            client.players!.set(guild.id, player);

            await player.play(vc);

            let msg: string = 'Added to the queue:\n';

            for (let i = 0; i < tracks.length; i++) {
                msg += `${i + 1}. ${tracks[i].title}\nDuration: ${tracks[i].durationRaw}\n`;
            }

            message.reply(msg);

            return;
        }

        player.addToQueue(tracks);

        if (!player.currentTrack)
            await player.play(vc);

        else if (player.player.state.status === AudioPlayerStatus.Paused)
            player.resume();

        let msg: string = 'Added to the queue:\n';

        for (let i = 0; i < tracks.length; i++) {
            msg += `${player.guildSongsQueue.length + i + 1}. ${tracks[i].title}\nDuration: ${tracks[i].durationRaw}\n`;
        }

        message.reply(msg);
    },
} as Command;