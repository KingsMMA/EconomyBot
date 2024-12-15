import {Snowflake} from "discord-api-types/globals";

export interface ServerConfig {
    guildId: Snowflake;
    initialBalance: number;
    messageRewardFormula: string;
    dailyMin: number;
    dailyMax: number;
}

export interface ServerData {
    guildId: Snowflake;
    userBalances: Record<Snowflake, number>;
}

