import {Client} from "discord.js";
import {Command} from "./Command";
import {GuildPlayer} from "./GuildPlayer";

export interface MyClient extends Client {
    commands?: Map<string, Command>;
    players?: Map<string, GuildPlayer>
}