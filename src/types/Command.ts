import {Message} from "discord.js";

export type Command = {
    name: string,
    description: string,
    execute: (message: Message) => void,
    argsNumber?: number;
}