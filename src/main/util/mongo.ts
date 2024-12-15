import type { Snowflake } from 'discord-api-types/globals';
import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb';

import type Main from '../main';
import type {ServerData, UserBalances} from './types';

export default class Mongo {

    private mongo!: Db;
    main: Main;

    constructor(main: Main) {
        this.main = main;
    }

    async connect() {
        const client = await MongoClient.connect(process.env.MONGO_URI!);
        this.mongo = client.db(this.main.config.mongo.database);
        console.info(`Connected to Database ${this.mongo.databaseName}`);

        console.info(`Fetching user balances for ${this.main.client.guilds.cache.size} saved guilds...`);
        this.main.client.serverCache = await this.fetchAllUserBalances();
        console.info('Finished fetching user balances.');

        setInterval(() => this.saveAllUserBalances(this.main.client.serverCache), 1000 * Number(process.env.AUTOSAVE_INTERVAL));
    }

    async fetchAllUserBalances(): Promise<Record<Snowflake, UserBalances>> {
        return Object.fromEntries(
            (await this.mongo
                .collection('balances')
                .find()
                .toArray())
                .map(({ guildId, userBalances }) => [
                    guildId, userBalances
                ]));
    }

    async saveAllUserBalances(data: Record<Snowflake, UserBalances>) {
        await Promise.all(
            Object.entries(data)
                .map(([
                    guildId, userBalances
                ]) => this.mongo
                    .collection('balances')
                    .updateOne({ guildId }, { $set: { userBalances } }, { upsert: true })));
    }

}
