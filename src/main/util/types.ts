import type { Snowflake } from 'discord-api-types/globals';

export interface ServerData {
    guildId: Snowflake;
    userBalances: Record<Snowflake, number>;
}

