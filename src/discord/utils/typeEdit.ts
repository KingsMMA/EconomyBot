import { randomUUID } from 'node:crypto';

import chalk from 'chalk';
import type {
    InteractionReplyOptions,
    InteractionResponse,
    Message,
    MessagePayload,
    PermissionResolvable, TextInputBuilder
} from 'discord.js';
import {
    ActionRowBuilder, ButtonBuilder, ModalBuilder, ModalSubmitInteraction
} from 'discord.js';
import { ButtonInteraction } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { ButtonStyle, ComponentType } from 'discord-api-types/v10';

import KingsDevEmbedBuilder from './kingsDevEmbedBuilder';

const loggerInitialisedMessage = 'Logger initialised';

declare module 'discord.js' {
    interface CommandInteraction {
        /**
         * Shows a modal to the user and returns the strings they inputted.
         * @param title The total of the modal
         * @param inputs The inputs to show in the modal
         * @returns The interaction and the strings the user inputted.
         */
        getStringFromModal(title: string, inputs: TextInputBuilder[]): Promise<[ModalSubmitInteraction | null, Record<string, string> | null]>;

        safeReply(options: string | MessagePayload | InteractionReplyOptions): Promise<Message | InteractionResponse>;
        replySuccess(message: string, ephemeral?: boolean): Promise<Message | InteractionResponse>;
        replyError(message: string, ephemeral?: boolean): Promise<Message | InteractionResponse>;
        replyConfirmation(message: string, ephemeral?: boolean): Promise<boolean>;

        /**
         * Checks if the user has the required permissions to run the command (or admin).
         * @param permission The permission to check for.
         * @param error The error message to send if the user does not have the required permissions.
         * @returns Whether the command should stop execution.
         */
        permCheck(permission: PermissionResolvable, error?: string): boolean;
    }
    interface ButtonInteraction {
        /**
         * Shows a modal to the user and returns the strings they inputted.
         * @param title The total of the modal
         * @param inputs The inputs to show in the modal
         * @returns The interaction and the strings the user inputted.
         */
        getStringFromModal(title: string, inputs: TextInputBuilder[]): Promise<[ModalSubmitInteraction | null, Record<string, string> | null]>;

        safeReply(options: string | MessagePayload | InteractionReplyOptions): Promise<Message | InteractionResponse>;
        replySuccess(message: string, ephemeral?: boolean): Promise<Message | InteractionResponse>;
        replyError(message: string, ephemeral?: boolean): Promise<Message | InteractionResponse>;
        replyConfirmation(message: string, ephemeral?: boolean): Promise<boolean>;
    }
    interface ModalSubmitInteraction {
        safeReply(options: string | MessagePayload | InteractionReplyOptions): Promise<Message | InteractionResponse>;
        replySuccess(message: string, ephemeral?: boolean): Promise<Message | InteractionResponse>;
        replyError(message: string, ephemeral?: boolean): Promise<Message | InteractionResponse>;
        replyConfirmation(message: string, ephemeral?: boolean): Promise<boolean>;
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

        /**
         * Formats a number to have commas every 3 digits.
         */
        formatNumber(): string;
    }
    interface Date {
        /**
         * Converts a date to a discord timestamp.
         */
        toDiscord(format: 'relative' | 'HH:MM' | 'HH:MM:SS' | 'DD/MM/YYYY' | 'DD MMMM YYYY' | 'DD MMMM YYYY HH:MM' | 'dddd, DD MMMM YYYY HH:MM'): string;
    }
}

CommandInteraction.prototype.getStringFromModal = ButtonInteraction.prototype.getStringFromModal = async function (title, inputs): Promise<[ModalSubmitInteraction | null, Record<string, string> | null]> {
    const id = randomUUID();
    await this.showModal(new ModalBuilder()
        .setTitle(title)
        .setCustomId(id)
        .addComponents(
            ...inputs.map(input => new ActionRowBuilder<TextInputBuilder>()
                .addComponents(input))
        ));
    const response = await this.awaitModalSubmit({
        time: 120000,
        filter: i => i.user.id === this.user.id && i.customId === id,
    })
        .catch(() => null);
    if (!response) return [
        null, null
    ];
    return [
        response, Object.fromEntries(response.components.map(row => [
            row.components[0].customId, row.components[0].value
        ]))
    ];
};

CommandInteraction.prototype.safeReply = ButtonInteraction.prototype.safeReply = ModalSubmitInteraction.prototype.safeReply = async function (options: string | MessagePayload | InteractionReplyOptions) {
    if (this.replied || !this.isRepliable() || this.deferred)
        return this.editReply(options);
    else
        return this.reply(options);
};

CommandInteraction.prototype.replySuccess = ButtonInteraction.prototype.replySuccess = ModalSubmitInteraction.prototype.replySuccess = async function (message: string, ephemeral?: boolean) {
    return this.safeReply({
        ephemeral: ephemeral,
        embeds: [
            new KingsDevEmbedBuilder()
                .setColor('Green')
                .setTitle('Success')
                .setDescription(message)
        ],
    });
};

CommandInteraction.prototype.replyError = ButtonInteraction.prototype.replyError = ModalSubmitInteraction.prototype.replyError = async function (message: string, ephemeral?: boolean) {
    return this.safeReply({
        ephemeral: ephemeral,
        embeds: [
            new KingsDevEmbedBuilder()
                .setColor('Red')
                .setTitle('Error')
                .setDescription(message)
        ],
    });
};

CommandInteraction.prototype.replyConfirmation = ButtonInteraction.prototype.replyConfirmation = ModalSubmitInteraction.prototype.replyConfirmation = async function (message: string, ephemeral?: boolean): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
        if (!(this.replied || !this.isRepliable() || this.deferred)) await this.deferReply();
        const response = await this.followUp({
            ephemeral: ephemeral,
            embeds: [
                new KingsDevEmbedBuilder()
                    .setColor('Yellow')
                    .setTitle('Are you sure?')
                    .setDescription(message)
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents([
                        new ButtonBuilder()
                            .setCustomId('confirm')
                            .setLabel('Confirm')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('cancel')
                            .setLabel('Cancel')
                            .setStyle(ButtonStyle.Danger)
                    ])
            ]
        });

        const buttonInt = await response.awaitMessageComponent({
            componentType: ComponentType.Button,
            time: 60000,
            filter: i => i.user.id === this.user.id &&
                (i.customId === 'confirm' || i.customId === 'cancel')
        })
            .catch(() => {
                this.editReply({
                    embeds: [
                        new KingsDevEmbedBuilder()
                            .setColor('Red')
                            .setTitle('Timed out.')
                            .setDescription('This timed out.  Please try again.')
                    ],
                    components: []
                });
                resolve(false);
            });

        if (!buttonInt) return resolve(false);

        await buttonInt.deferUpdate();
        if (buttonInt.customId === 'confirm') {
            await this.editReply({
                embeds: [
                    new KingsDevEmbedBuilder()
                        .setColor('Green')
                        .setTitle('Confirmed')
                        .setDescription('This action has been confirmed.')
                ],
                components: []
            });
            resolve(true);
        } else if (buttonInt.customId === 'cancel') {
            await this.editReply({
                embeds: [
                    new KingsDevEmbedBuilder()
                        .setColor('Red')
                        .setTitle('Cancelled')
                        .setDescription('This action has been cancelled.')
                ],
                components: []
            });
            resolve(false);
        }
    });
};

CommandInteraction.prototype.permCheck = function (permission: PermissionResolvable, error?: string) {
    if (this.member.permissions.has(permission, true)) return false;
    void this.replyError(error ?? 'You do not have the required permissions to run this command.');
    return true;
};

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

Number.prototype.formatNumber = function () {
    return this.toLocaleString('en-US');
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
