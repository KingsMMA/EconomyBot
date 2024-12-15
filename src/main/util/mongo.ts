import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb';

import type Main from '../main';
import {ServerConfig, ServerData} from "./types";
import {Snowflake} from "discord-api-types/globals";

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
    }

    async fetchServerConfig(guildId: Snowflake): Promise<ServerConfig> {
        return await this.mongo
            .collection('config')
            .findOne({ guildId }) as ServerConfig | null ?? {
            guildId,
            initialBalance: 0,
            messageRewardFormula: '0',
            dailyMin: 0,
            dailyMax: 0
        };
    }

    async saveServerConfig(data: ServerConfig) {
        await this.mongo
            .collection('config')
            .updateOne({ guildId: data.guildId }, { $set: data }, { upsert: true });
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

}
