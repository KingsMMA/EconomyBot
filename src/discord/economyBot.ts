import type { ClientOptions } from 'discord.js';
import { Client, Collection } from 'discord.js';
import type { Snowflake } from 'discord-api-types/globals';
import type { PathLike } from 'fs';
import path from 'path';

import type Main from '../main/main';
import type { ServerData } from '../main/util/types';
import type BaseCommand from './commands/base.command';

export default class EconomyBot extends Client {

    main: Main;
    commands: Collection<string, BaseCommand> = new Collection();

    serverCache: Record<Snowflake, ServerData> = {};

    constructor(main: Main, options: ClientOptions) {
        super(options);
        this.main = main;
    }

    loadCommand(commandPath: PathLike, commandName: string) {
        try {
            const command: BaseCommand = new (require(`${commandPath}${path.sep}${commandName}`).default)(this);
            console.info(`Loading Command: ${command.name}.`);
            this.commands.set(command.name, command);
        } catch (e) {
            return `Unable to load command ${commandName}: ${e}`;
        }
    }

    loadEvent(eventPath: PathLike, eventName: string) {
        try {
            const event = new (require(`${eventPath}${path.sep}${eventName}`).default)(this);
            console.info(`Loading Event: ${eventName}.`);
            this.on(eventName, (...args) => event.run(...args));
        } catch (e) {
            return `Unable to load event ${eventName}: ${e}`;
        }
    }

    getBalance(guildId: Snowflake, userId: Snowflake): number {
        return (this.serverCache[guildId]?.userBalances ?? {})[userId] ?? Number(process.env.INITIAL_BALANCE);
    }

}
