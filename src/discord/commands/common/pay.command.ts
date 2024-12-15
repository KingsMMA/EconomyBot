import type {AutocompleteInteraction, ChatInputCommandInteraction} from 'discord.js';
import {PermissionsBitField} from 'discord.js';
import {ApplicationCommandOptionType, ApplicationCommandType} from 'discord-api-types/v10';

import type EconomyBot from '../../economyBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class PayCommand extends BaseCommand {
    constructor(client: EconomyBot) {
        super(client, {
            name: 'pay',
            description: 'Give another user some or all of your balance.',
            type: ApplicationCommandType.ChatInput,
            options: [
                {
                    name: 'user',
                    description: 'The user you want to pay.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'amount',
                    description: 'The amount you want to pay.',
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                },
            ],
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user', true);
        const amount = interaction.options.getInteger('amount', true);

        if (amount < 1)
            return interaction.replyError('You cannot pay less than $1.');
        if (interaction.user.id === user.id)
            return interaction.replyError('You cannot pay yourself.');

        let balance = this.client.getBalance(interaction.guildId!, interaction.user.id);
        if (balance < amount)
            return interaction.replyError('You do not have enough money to pay that amount.');

        if (!await interaction.replyConfirmation(`Are you sure you want to pay ${user.toString()} (${user.username}) $${amount.formatNumber()} from your balance?\n\nYou will have $${(balance - amount).formatNumber()} left.`))
            return;

        if (!this.client.serverCache[interaction.guildId!])
            this.client.serverCache[interaction.guildId!] = {};

        balance = this.client.getBalance(interaction.guildId!, interaction.user.id);
        if (balance < amount)
            return interaction.replyError('You do not have enough money to pay that amount.');

        this.client.serverCache[interaction.guildId!][interaction.user.id] = balance - amount;
        this.client.serverCache[interaction.guildId!][user.id] = this.client.getBalance(interaction.guildId!, user.id) + amount;

        await interaction.replySuccess(`You have successfully paid ${user.toString()} (${user.username}) $${amount.formatNumber()}.`);
    }

}
