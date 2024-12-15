import type { Message } from 'discord.js';

import type EconomyBot from '../economyBot';

export default class {

    client: EconomyBot;

    constructor(client: EconomyBot) {
        this.client = client;
    }

    async run(message: Message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const formula = process.env.MESSAGE_REWARD_FORMULA!
            .replaceAll('%length%', message.content.length.toString());
        const reward = eval(formula);
        if (!reward) return;

        if (!this.client.serverCache[message.guild.id]) {
            this.client.serverCache[message.guild.id] = {
                guildId: message.guild.id,
                userBalances: {},
                dailiesCollectedAt: {},
            };
        }

        if (!this.client.serverCache[message.guild.id].userBalances[message.author.id]) {
            this.client.serverCache[message.guild.id].userBalances[message.author.id] = Number(process.env.INITIAL_BALANCE);
        }

        this.client.serverCache[message.guild.id].userBalances[message.author.id] += reward;
    }

}
