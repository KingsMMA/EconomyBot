import type {AutocompleteInteraction, ChatInputCommandInteraction} from 'discord.js';
import {PermissionsBitField} from 'discord.js';
import {ApplicationCommandOptionType, ApplicationCommandType} from 'discord-api-types/v10';

import type EconomyBot from '../../economyBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class LeaderboardCommand extends BaseCommand {
    constructor(client: EconomyBot) {
        super(client, {
            name: 'leaderboard',
            description: 'View the top 10 users with the most balance',
            type: ApplicationCommandType.ChatInput,
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const balances = Object.entries(this.client.serverCache[interaction.guildId!] ?? {})
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        if (!balances.length) {
            return interaction.replyError('No users have a balance yet.');
        }

        const embed = new KingsDevEmbedBuilder()
            .setTitle('Top 10 Users')
            .setDescription(balances.map(([userId, balance], i) => `**${i + 1}.** <@${userId}> - ${balance.formatNumber()}`).join('\n'))
            .setColor('DarkAqua')
        await interaction.reply({embeds: [embed]});
    }

}
