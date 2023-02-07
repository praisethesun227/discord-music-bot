import {MyClient} from "../types/MyClient";
import {Message, PermissionFlagsBits} from "discord.js";

export function basicMessageCheck(message: Message, options: checkOptions): boolean {
    const guild = message.guild;
    const client = message.client as MyClient;
    const vc = message.member?.voice?.channel;
    const permissions = vc?.permissionsFor(client.user!);

    try {
        if (options.fromGuild) {
            checkFromGuild();
        }

        if (options.guildHasAssociatedPlayer) {
            checkGuildHasAssociatedPlayer();
        }

        if (options.senderIsInVc) {
            checkSenderIsInVc();
        }

        if (options.permissions) {
            checkPermissions(options.permissions);
        }
    }

    catch (e) {
        console.log(e);
    }

    //no options scenario
    return true;

    //////////////////////////////////////////////

    function checkFromGuild() {
        if (!guild)
            throw new Error('The message is not from guild');

        return true;
    }

    function checkGuildHasAssociatedPlayer() {
        checkFromGuild();

        if (!client.players?.get(guild?.id!))
            throw new Error('No player for this guild');

        return true;
    }

    function checkSenderIsInVc() {
        checkFromGuild();

        if (!vc)
            throw new Error('Sender of the message is not in vc');

        return true;
    }

    function checkPermissions(perms: (keyof typeof PermissionFlagsBits)[]) {
        let missingPerms = [];

        for (const perm of perms) {
            if (!permissions!.has(perm))
                missingPerms.push(perm);
        }

        if (missingPerms.length !== 0)
            throw new Error(`The following permissions are missing: ${missingPerms.join('\n')}`);

        return true;
    }
}

interface checkOptions {
    fromGuild?: boolean;
    guildHasAssociatedPlayer?: boolean;
    senderIsInVc?: boolean;
    permissions?: (keyof typeof PermissionFlagsBits)[];
}