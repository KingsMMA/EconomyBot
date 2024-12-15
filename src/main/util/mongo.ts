import type { Snowflake } from 'discord-api-types/globals';
import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb';

import type Main from '../main';
import type { ServerData } from './types';

export default class Mongo {

    private mongo!: Db;
    main: Main;

    constructor(main: Main) {
        this.main = main;
    }

    async connect() {
        const client = await MongoClient.connect(process.env.MONGO_URI!);
        this.mongo = client.db('EconomyBot');
        console.info(`Connected to Database ${this.mongo.databaseName}`);

        console.info(`Fetching user balances for ${this.main.client.guilds.cache.size} saved guilds...`);
        this.main.client.serverCache = await this.fetchAllUserBalances();
        console.info('Finished fetching user balances.');

        setInterval(() => this.saveAllUserBalances(this.main.client.serverCache), 1000 * Number(process.env.AUTOSAVE_INTERVAL));
    }

    async fetchAllUserBalances(): Promise<Record<Snowflake, ServerData>> {
        return Object.fromEntries(
            (await this.mongo
                .collection('servers')
                .find()
                .toArray())
                .map(data => [
                    data.guildId, data
                ]));
    }

    async saveAllUserBalances(data: Record<Snowflake, ServerData>) {
        await Promise.all(
            Object.entries(data)
                .map(([
                    guildId, serverData
                ]) => this.mongo
                    .collection('servers')
                    .updateOne({ guildId }, { $set: serverData }, { upsert: true })));
    }

}
