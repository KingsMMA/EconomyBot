import {AutocompleteInteraction, ChatInputCommandInteraction, TextInputBuilder} from 'discord.js';
import {PermissionsBitField} from 'discord.js';
import {ApplicationCommandOptionType, ApplicationCommandType, TextInputStyle} from 'discord-api-types/v10';

import type EconomyBot from '../../economyBot';
import KingsDevEmbedBuilder from '../../utils/kingsDevEmbedBuilder';
import BaseCommand from '../base.command';

export default class SetCommand extends BaseCommand {
    constructor(client: EconomyBot) {
        super(client, {
            name: 'set',
            description: 'Sets a user\'s balance to a specific amount.',
            type: ApplicationCommandType.ChatInput,
            default_member_permissions: PermissionsBitField.Flags.ManageGuild.toString(),
            options: [
                {
                    name: 'user',
                    description: 'The user to set the balance of.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'amount',
                    description: 'The amount to set the balance to.',
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                }
            ],
        });
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user', true);
        const amount = interaction.options.getInteger('amount', true);

        if (amount < 0)
            return interaction.replyError('You cannot set a balance less than $0.');

        let [modalInt, inputs] =
            await interaction.getStringFromModal('Enter Confirmation Code', [
                new TextInputBuilder()
                    .setCustomId('confirmation_code')
                    .setLabel('Please enter the confirmation code below:')
                    .setPlaceholder('Confirmation Code')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
            ]);
        if (!modalInt || !inputs) return;
        if (inputs['confirmation_code'] !== process.env.CONFIRMATION_CODE)
            return modalInt.replyError('Invalid confirmation code.', true);

        if (!await modalInt.replyConfirmation(`Are you sure you want to set ${user.toString()} (${user.username})'s balance to $${amount.formatNumber()}?`))
            return;

        if (!this.client.serverCache[interaction.guildId!])
            this.client.serverCache[interaction.guildId!] = {
                guildId: interaction.guildId!,
                userBalances: {},
                dailiesCollectedAt: {},
            };

        this.client.serverCache[interaction.guildId!].userBalances[user.id] = amount;

        await modalInt.replySuccess(`You have successfully set ${user.toString()} (${user.username})'s balance to $${amount.formatNumber()}.`);
    }

}
