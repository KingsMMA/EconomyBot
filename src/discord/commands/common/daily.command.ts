import type { ChatInputCommandInteraction } from 'discord.js';
import { ApplicationCommandType } from 'discord-api-types/v10';

import type EconomyBot from '../../economyBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class DailyCommand extends BaseCommand {

    constructor(client: EconomyBot) {
        super(client, {
            name: 'daily',
            description: 'Claim your daily reward!',
            type: ApplicationCommandType.ChatInput,
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const lastClaimed = this.client.serverCache[interaction.guildId!]?.dailiesCollectedAt[interaction.user.id] ?? 0;
        const now = Date.now();
        if (lastClaimed + 24 * 60 * 60 * 1000 > now)
            return interaction.replyError(`You have already claimed your daily reward.\nYou can claim it again ${new Date(lastClaimed + 24 * 60 * 60 * 1000).toDiscord('relative')}.`, true);

        const minReward = Number(process.env.DAILY_MIN);
        const maxReward = Number(process.env.DAILY_MAX);
        const reward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;

        if (!this.client.serverCache[interaction.guildId!])
            this.client.serverCache[interaction.guildId!] = {
                guildId: interaction.guildId!,
                userBalances: {},
                dailiesCollectedAt: {},
            };
        this.client.serverCache[interaction.guildId!].dailiesCollectedAt[interaction.user.id] = now;
        this.client.serverCache[interaction.guildId!].userBalances[interaction.user.id] =
            this.client.getBalance(interaction.guildId!, interaction.user.id) + reward;

        return interaction.reply({
            embeds: [
                new KingsDevEmbedBuilder()
                    .setTitle('Daily Reward')
                    .setDescription(`You have claimed your daily reward of $${reward}.`)
                    .setColor('DarkAqua')
            ],
        });
    }

}
