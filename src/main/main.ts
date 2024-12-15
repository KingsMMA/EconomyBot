import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import type EconomyBot from '../discord/economyBot';
import { init } from '../discord/init';
import loggerInitialisedMessage from '../discord/utils/typeEdit';
import type config from './data/config.json';
import Mongo from './util/mongo';

export default class Main {

    mongo: Mongo;
    client!: EconomyBot;

    constructor() {
        console.log(loggerInitialisedMessage);
        this.mongo = new Mongo(this);
    }

    async initialize() {
        dotenv.config({
            path: __dirname + path.sep + '..' + path.sep + '..' + path.sep + '.env',
        });

        for (const required_key of ['BOT_ID', 'BOT_TOKEN', 'MONGO_URI', 'AUTOSAVE_INTERVAL', 'INITIAL_BALANCE', 'MESSAGE_REWARD_FORMULA', 'DAILY_MIN', 'DAILY_MAX']) {
            if (!process.env[required_key]) {
                throw new Error(`Missing required environment variable: ${required_key}`);
            }
        }

        for (const required_number of ['AUTOSAVE_INTERVAL', 'INITIAL_BALANCE', 'DAILY_MIN', 'DAILY_MAX']) {
            let envNumber = Number(process.env[required_number]);
            if (isNaN(envNumber)) {
                throw new Error(`Environment variable ${required_number} must be a number`);
            } else if (!Number.isInteger(envNumber)) {
                throw new Error(`Environment variable ${required_number} must be an integer`);
            } else if (envNumber < 0) {
                throw new Error(`Environment variable ${required_number} must be a positive number`);
            }
        }

        if (Number(process.env.AUTOSAVE_INTERVAL) < 3) {
            throw new Error('AUTOSAVE_INTERVAL must be at least 3 seconds');
        }

        let dailyMin = Number(process.env.DAILY_MIN);
        let dailyMax = Number(process.env.DAILY_MAX);
        if (dailyMin > dailyMax) {
            throw new Error('DAILY_MIN must be less than or equal to DAILY_MAX');
        }

        if (!/^(\d+|%length%) ?([+\-*\/] ?(\d+|%length%))+$/.test(process.env.MESSAGE_REWARD_FORMULA!)) {
            throw new Error('MESSAGE_REWARD_FORMULA is not a valid expression and should instead match the regex /^(\\d+|%length%) ?([+\\-*\\/] ?(\\d+|%length%))+$/');
        }

        this.client = await init(this);
        await this.mongo.connect();
    }

    get config(): typeof config {
        return JSON.parse(fs.readFileSync('./src/main/data/config.json')
            .toString());
    }

    set config(config) {
        fs.writeFileSync('./src/main/data/config.json', JSON.stringify(config, null, 2));
    }

}
