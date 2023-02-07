import {Command} from "../types/Command";
import {MyClient} from "../types/MyClient";

module.exports = {
    name: 'help',
    description: 'Display this message',

    async execute (message) {
        const client = message.client as MyClient;
        let msg: string = '';

        for (let [name, command] of client.commands!) {
            msg += `${name}: ${command.description}\n------------------------\n`;
        }

        message.reply(msg);
    }
} as Command