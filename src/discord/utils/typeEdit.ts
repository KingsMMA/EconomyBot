import chalk from 'chalk';
import {InteractionResponse, Message, PermissionResolvable} from 'discord.js';
import { ButtonInteraction } from 'discord.js';
import { CommandInteraction } from 'discord.js';

import KingsDevEmbedBuilder from './kingsDevEmbedBuilder';

const loggerInitialisedMessage = 'Logger initialised';

declare module 'discord.js' {
    interface CommandInteraction {
        replySuccess(message: string, ephemeral?: boolean): Promise<Message | InteractionResponse>;
        replyError(message: string, ephemeral?: boolean): Promise<Message | InteractionResponse>;

        permCheck(permission: PermissionResolvable): boolean;
    }
    interface ButtonInteraction {
        replySuccess(message: string, ephemeral?: boolean): Promise<Message | InteractionResponse>;
        replyError(message: string, ephemeral?: boolean): Promise<Message | InteractionResponse>;
    }
}

declare global {
    interface String {
        /**
         * Converts a duration string to a duration in milliseconds.  The string should be in the format of ``1d 2h 3m 4s``.
         * Returns ``-1`` if the string is not in the correct format.
         */
        parseDuration(): number;
    }
    interface Number {
        /**
         * Converts a number to ``W days, X hours, Y minutes, Z seconds`` format.
         */
        formatTime(): string;
    }
    interface Date {
        /**
         * Converts a date to a discord timestamp.
         */
        toDiscord(format: 'relative' | 'HH:MM' | 'HH:MM:SS' | 'DD/MM/YYYY' | 'DD MMMM YYYY' | 'DD MMMM YYYY HH:MM' | 'dddd, DD MMMM YYYY HH:MM'): string;
    }
}

CommandInteraction.prototype.replySuccess = ButtonInteraction.prototype.replySuccess = async function (message: string, ephemeral?: boolean) {
    if (this.replied || !this.isRepliable() || this.deferred)
        return this.editReply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setColor('Green')
                    .setTitle('Success')
                    .setDescription(message)
            ],
        });
    else
        return this.reply({
            ephemeral: ephemeral,
            embeds: [
                new KingsDevEmbedBuilder()
                    .setColor('Green')
                    .setTitle('Success')
                    .setDescription(message)
            ],
        });
};

CommandInteraction.prototype.replyError = ButtonInteraction.prototype.replyError = async function (message: string, ephemeral?: boolean) {
    if (this.replied || !this.isRepliable() || this.deferred)
        return this.editReply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setColor('Red')
                    .setTitle('Error')
                    .setDescription(message)
            ],
        });
    else
        return this.reply({
            ephemeral: ephemeral,
            embeds: [
                new KingsDevEmbedBuilder()
                    .setColor('Red')
                    .setTitle('Error')
                    .setDescription(message)
            ],
        });
};

CommandInteraction.prototype.permCheck = function (permission: PermissionResolvable) {
    if (this.member.permissions.has(permission, true)) return true;
    void this.replyError(`You do not have the required permissions to run this command.`);
    return false;
}

String.prototype.parseDuration = function(): number {
    const regex = /(?:(\d+)d)? ?(?:(\d+)h)? ?(?:(\d+)m)? ?(?:(\d+)s)?/g;
    const matches = regex.exec(this.valueOf());
    if (!matches) return -1;

    const days = parseInt(matches[1]) || 0;
    const hours = parseInt(matches[2]) || 0;
    const minutes = parseInt(matches[3]) || 0;
    const seconds = parseInt(matches[4]) || 0;

    return (days * 86400000) + (hours * 3600000) + (minutes * 60000) + (seconds * 1000);
};

Number.prototype.formatTime = function () {
    const days = Math.floor(this.valueOf() / 86400000);
    const hours = Math.floor((this.valueOf() % 86400000) / 3600000);
    const minutes = Math.floor(((this.valueOf() % 86400000) % 3600000) / 60000);
    const seconds = Math.floor((((this.valueOf() % 86400000) % 3600000) % 60000) / 1000);
    const components: string[] = [];
    if (days > 0) components.push(`${days} day${days === 1 ? '' : 's'}`);
    if (hours > 0) components.push(`${hours} hour${hours === 1 ? '' : 's'}`);
    if (minutes > 0)
        components.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
    if (seconds > 0)
        components.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
    return components.length === 0 ?
        '0 seconds' :
        components.length === 1 ?
            components[0] :
            components.length === 2 ?
                `${components[0]} and ${components[1]}` :
                components.length === 3 ?
                    `${components[0]}, ${components[1]}, and ${components[2]}` :
                    `${components[0]}, ${components[1]}, ${components[2]}, and ${components[3]}`;
};

Date.prototype.toDiscord = function (format) {
    switch (format) {
        case 'relative':
            return `<t:${Math.floor(this.valueOf() / 1000)}:R>`;
        case 'HH:MM':
            return `<t:${Math.floor(this.valueOf() / 1000)}:t>`;
        case 'HH:MM:SS':
            return `<t:${Math.floor(this.valueOf() / 1000)}:T>`;
        case 'DD/MM/YYYY':
            return `<t:${Math.floor(this.valueOf() / 1000)}:d>`;
        case 'DD MMMM YYYY':
            return `<t:${Math.floor(this.valueOf() / 1000)}:D>`;
        case 'DD MMMM YYYY HH:MM':
            return `<t:${Math.floor(this.valueOf() / 1000)}:f>`;
        case 'dddd, DD MMMM YYYY HH:MM':
            return `<t:${Math.floor(this.valueOf() / 1000)}:F>`;
    }
};

const real = {
    log: console.log,
    error: console.error,
};

console.log = (message?: any, ...optionalParams: any[]) => {
    const params = [
        message
    ];
    if (optionalParams.length) {
        params.push(...optionalParams);
    }
    for (let i = 0; i < params.length; i++) {
        if (typeof params[i] === 'string') {
            params[i] = chalk.blue(params[i]);
        }
    }
    real.log(chalk.red(`[${time()}] >`), ' ', ...params);
};

console.info = (message?: any, ...optionalParams: any[]) => {
    const params = [
        message
    ];
    if (optionalParams.length) {
        params.push(...optionalParams);
    }
    for (let i = 0; i < params.length; i++) {
        if (typeof params[i] === 'string') {
            params[i] = chalk.cyan(params[i]);
        }
    }
    real.log(chalk.red(`[${time()}] >`), ' ', ...params);
};

console.debug = (message?: any, ...optionalParams: any[]) => {
    const params = [
        message
    ];
    if (optionalParams.length) {
        params.push(...optionalParams);
    }
    real.log(chalk.red(`[${time()}] >`), ' ', chalk.blueBright(...params));
};

console.error = (e: Error) => {
    real.error(chalk.bgRedBright.white(`[${time()}] ERROR >`), ' ', chalk.red(e), chalk.red(e.stack));
};

function time() {
    return new Date()
        .toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
}

export default loggerInitialisedMessage;
