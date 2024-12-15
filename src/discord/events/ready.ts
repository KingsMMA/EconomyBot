import type EconomyBot from '../economyBot';

export default class {

    client: EconomyBot;

    constructor(client: EconomyBot) {
        this.client = client;
    }

    run() {
        console.info(`Successfully logged in! \nSession Details: id=${this.client.user?.id} tag=${this.client.user?.tag}`);
    }

}
