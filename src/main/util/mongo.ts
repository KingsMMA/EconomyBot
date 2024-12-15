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
    }

    async fetchUserBalances(guildId: Snowflake): Promise<ServerData> {
        return await this.mongo
            .collection('balances')
            .findOne({ guildId }) as ServerData | null ?? { guildId, userBalances: {} };
    }

    async saveUserBalances(data: ServerData) {
        await this.mongo
            .collection('balances')
            .updateOne({ guildId: data.guildId }, { $set: data }, { upsert: true });
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

}
