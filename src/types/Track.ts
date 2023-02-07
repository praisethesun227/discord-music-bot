import {Readable} from "stream";
import play, {SoundCloudTrack, YouTubeVideo} from "play-dl";
import {convertSecsToMinsAndSecs} from "../utils/convertSecsToMinsAndSecs";

enum StreamType {
    Arbitrary = "arbitrary",
    Raw = "raw",
    OggOpus = "ogg/opus",
    WebmOpus = "webm/opus",
    Opus = "opus"
}

export class Track {
    constructor(info: YouTubeVideo | SoundCloudTrack) {
        if (info instanceof YouTubeVideo) {
            this.title = info.title ? info.title : "Unknown";
            this.durationRaw = info.durationRaw;
        }

        else {
            this.title = info.name;
            this.durationRaw = convertSecsToMinsAndSecs(info.durationInSec);
        }

        this.url = info.url;
        this.durationInSec = info.durationInSec;
    }

    title: string;
    url: string;
    durationRaw: string;
    durationInSec: number;
    stream!: Readable;
    type!: StreamType;
    async refreshStream() {
        try {
            this.stream.destroy();
        } catch (_) {}

        let newStream = await play.stream(this.url, {quality: 2});
        this.stream = newStream.stream;
        this.type = newStream.type;
    };
}
