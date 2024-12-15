import type { Snowflake } from 'discord-api-types/globals';

export type UserBalances = Record<Snowflake, number>;

export interface ServerData {
    guildId: Snowflake;
    userBalances: UserBalances;
}

