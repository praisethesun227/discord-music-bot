import {Track} from "../types/Track";
import play, {SearchOptions, SoundCloudPlaylist, SoundCloudTrack, YouTubePlayList, YouTubeVideo} from 'play-dl';

export async function getTracks(trackName: string, searchOptions?: SearchOptions): Promise<Track[] | void>{
    let tracks: Track[] = [];
    let resources;

    searchOptions = {...searchOptions, unblurNSFWThumbnails: true, limit: 1};

    resources = (await play.search(trackName, {...searchOptions}))[0];

    console.log(resources);

    if (resources instanceof SoundCloudPlaylist)
        tracks = (await resources.all_tracks()).map(sc => new Track(sc));

    if (resources instanceof YouTubePlayList)
        tracks = (await resources.all_videos()).map(yt => new Track(yt));

    if (resources instanceof SoundCloudTrack || resources instanceof YouTubeVideo)
        tracks.push(new Track(resources));

    if (tracks.length === 0) return;

    return tracks;
}
