import {Client, Events, GatewayIntentBits} from 'discord.js';
import {prefix, token} from "../config.json";
import {MyClient} from "./types/MyClient";
import {Command} from "./types/Command";
import {GuildPlayer} from "./types/GuildPlayer";

import fs from 'node:fs';
import path from 'node:path';

const client: MyClient = new Client({ intents:
        [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
        ]
});

client.players = new Map<string, GuildPlayer>();

client.commands = new Map<string, Command>();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command: Command = require(filePath);

    if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const msgContent = message.content;
    if (!msgContent.startsWith(prefix)) return;
    let commandName;

    if (msgContent.indexOf(' ') !== -1) {
        commandName = msgContent.slice(prefix.length, msgContent.indexOf(' '));
    }
    else { commandName = msgContent.slice(prefix.length) }

    const command = client.commands?.get(commandName);

    if (!command) {
        console.error(`No command matching ${commandName} was found.`);
        return;
    }

    try {
        await command.execute(message);
    } catch (error) {
        console.error(error);
        await message.reply(`shieeeeeeeeet nigguh`);
    }
})

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(token);