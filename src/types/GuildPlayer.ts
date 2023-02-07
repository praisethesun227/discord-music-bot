import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioResource,
    DiscordGatewayAdapterCreator,
    getVoiceConnection,
    joinVoiceChannel,
    PlayerSubscription,
    VoiceConnection,
    VoiceConnectionStatus
} from "@discordjs/voice";
import {Readable} from "stream";
import {Track} from "./Track";
import {Guild, VoiceBasedChannel} from "discord.js";
import {shuffleArray} from "../utils/shuffleArray";

export class GuildPlayer {
    constructor(guild: Guild,
                guildSongsQueue: Track[])
    {
        this.guild = guild;
        this.player = new AudioPlayer();
        this.guildSongsQueue = guildSongsQueue;
        this.currentConnection = getVoiceConnection(guild.id);
    }

    readonly guild: Guild;
    readonly player: AudioPlayer;
    currentSubscription?: PlayerSubscription;
    currentConnection?: VoiceConnection
    currentTrack?: Track;
    currentVc?: VoiceBasedChannel;
    currentStream?: Readable;
    guildSongsQueue: Track[];
    trackPointer: number = 0;
    looped: boolean = false;
    playlistLooped: boolean = false;

    async play(vc: VoiceBasedChannel) {
        this.currentVc = vc;

        //if the queue is empty, stop the player
        if (this.guildSongsQueue.length === 0) {
            stop();
            console.log('The player was stopped because the queue is empty');
            return;
        }

        //if the queue is fully traversed, stop the player
        if (this.trackPointer > this.guildSongsQueue.length - 1) {
            if (!this.playlistLooped) {
                this.stop();
                console.log('The player was stopped because the queue was fully traversed');
                return;
            }

            //skip stopping if the playlist is looped and set the pointer to the first track
            else
                this.trackPointer = 0;
        }

        this.currentTrack = this.guildSongsQueue[this.trackPointer];
        await this.currentTrack.refreshStream();
        this.currentStream = this.currentTrack.stream;

        let inputType = this.currentTrack.type;
        let audioResource;

        if (inputType)
            audioResource = createAudioResource(this.currentStream, {inputType});
        else
            audioResource = createAudioResource(this.currentStream);

        //if not connected to a vc, connect to it
        if (!this.currentConnection) {
            this.currentConnection = joinVoiceChannel({
                channelId: this.currentVc!.id,
                guildId: this.guild.id,
                adapterCreator: this.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
            })

            //stop if suddenly disconnected from a vc
            this.currentConnection.on(VoiceConnectionStatus.Disconnected,
                () => {
                this.stop();
                console.log('The player was stopped because the bot left the vc for some reason');
            })
        }

        //if vc is not subscribed to player, subscribe it
        if (!this.currentSubscription) {
            this.currentSubscription = this.currentConnection.subscribe(this.player);

            this.player.on(AudioPlayerStatus.Idle, () => setTimeout(() => {
                if (!this.looped)
                    this.trackPointer++;

                this.play(this.currentVc!);
            }, 1000));
        }

        this.player.play(audioResource);
    }

    stop() {
        this.player.removeAllListeners();
        this.currentConnection?.removeAllListeners();
        this.player.stop();
        this.currentStream?.destroy();
        this.currentSubscription?.unsubscribe();
        getVoiceConnection(this.guild.id)?.destroy();
        this.clearQueue()

        this.looped = false;
        this.playlistLooped = false;
        this.trackPointer = 0;
        this.currentStream = undefined;
        this.currentSubscription = undefined;
        this.currentTrack = undefined;
        this.currentConnection = undefined;
        this.currentVc = undefined;
    }

    pause() {
        if (!this.currentConnection || !this.currentSubscription || !this.currentTrack)
            return;
        this.player.pause();
    }

    resume() {
        if (!this.currentConnection || !this.currentSubscription || !this.currentTrack)
            return;
        this.player.unpause();
    }

    async shuffle() {
        this.player.pause();
        this.currentStream?.destroy();

        shuffleArray(this.guildSongsQueue);
        this.trackPointer = 0;

        await this.play(this.currentVc!);
    }

    async skip(): Promise<string[]> {
        this.player.pause();
        this.currentStream?.destroy();
        let oldTrack = this.guildSongsQueue[this.trackPointer]?.title;
        let newTrack = this.guildSongsQueue[this.trackPointer+1]?.title;

        this.trackPointer++;
        await this.play(this.currentVc!);

        if (!oldTrack)
            oldTrack = 'Nothing';
        if (!newTrack)
            newTrack = 'Nothing';

        return [oldTrack, newTrack];
    }

    loopPlaylist() {
        this.playlistLooped = true;
        this.looped = false;
    }

    unloopPlaylist() {
        this.playlistLooped = false;
    }

    loop() {
        if (this.trackPointer !== -1)
            this.looped = true;
        this.playlistLooped = false;
    }

    unloop() {
        this.looped = false;
    }

    private changePointer(position: number): boolean {
        if (position > this.guildSongsQueue.length - 1 || position < 0)
            return false;

        this.trackPointer = position;
        return true;
    }

    async jump(position: number): Promise<boolean> {
        const success = this.changePointer(position - 1)

        if (!success) return false

        this.player.pause();
        this.currentStream?.destroy();

        await this.play(this.currentVc!);

        return true;
    }

    addToQueue(tracks: Track | Track[]) {
        if (Array.isArray(tracks))
            this.guildSongsQueue = [...this.guildSongsQueue, ...tracks];
        else
            this.guildSongsQueue.push(tracks);
    }

    clearQueue() {
        this.guildSongsQueue = [];
    }
}