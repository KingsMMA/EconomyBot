import type {AutocompleteInteraction, ChatInputCommandInteraction, PermissionResolvable} from 'discord.js';
import {PermissionsBitField} from 'discord.js';
import {ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits} from 'discord-api-types/v10';

import type EconomyBot from '../../economyBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class BalanceCommand extends BaseCommand {
    constructor(client: EconomyBot) {
        super(client, {
            name: 'balance',
            description: 'Check your balance or the balance of another user.',
            type: ApplicationCommandType.ChatInput,
            options: [
                {
                    name: 'user',
                    description: 'The user to check the balance of.',
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
            ],
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user') ?? interaction.user;
        if (interaction.user.id !== user.id && interaction.permCheck(PermissionFlagsBits.ManageGuild, 'You do not have the required permissions to check another user\'s balance.')) return;

        const balance = this.client.getBalance(interaction.guildId!, user.id);
        const embed = new KingsDevEmbedBuilder()
            .setTitle(`Balance for ${user.username}`)
            .setDescription(`Balance: ${balance.formatNumber()}`)
            .setColor('DarkAqua')
            .setTimestamp();
        await interaction.reply({embeds: [embed]});
    }

}
