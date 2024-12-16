# Economy Bot
###### A commission developed by KingsDev

![Claiming the daily reward with /daily](https://github.com/user-attachments/assets/ceb97592-e58c-448d-a2ec-0ba3d45b000c)
###### To see more of my work, including more screenshots, go to https://kingrabbit.dev/

Economy Bot provides an in-depth economy system for Discord servers.  The bot is capable of handling any number of discord servers, with user balances being separate per-guild.  Users start with a configurable balance in each server and are able to increase this balance by claiming their daily reward (`/daily`, claimable every 24 hours) or by typing in the server.  Whenever a user sends a message, they earn an amount of money configurable through the [`MESSAGE_REWARD_FORMULA` environment variable](#running-the-bot).  This can be setup to provide larger rewards for longer messages.  Users can also pay other users and check the balances of the top 10 users in the server.  Administrators can use the `/set` command to manually modify the balance of a user in their server.

**Video demonstration:** https://youtu.be/AN6GCtHA61M

## Commands
`<>` required parameter  
`[]` optional parameter

### `/daily`
Gives the user a random amount of money between a range that can be configured.  Can only be used once every 24 hours.

### `/pay <user> <amount>`
Sends an amount of money to the target.

### `/set <user> <amount>`[*](## "Requires 'Manage Server' permissions, additional overrides can be set in Server Settings")
Edits a user's balance.

### `/balance [user]`[*](## "Specifying a user other than yourself requires the 'Manage Server' permission.")
See your or another user's balance.

### `/leaderboard`
Check the top 10 users with the most balance.

## Running the bot
The bot is built using Node.js 20.  To run the bot, install the required dependencies with `npm i` and then run the bot with `npm run start`.  
The bot requires environment variables to be set (optionally through the creation of a `.env` file):
- `BOT_ID` - The bot's user ID
- `BOT_TOKEN` - The bot token
- `MONGO_URI` - The MongoDB URI the bot should connect to.  This database will be used to store the ticket configs, ticket panels, and active tickets.

- `CONFIRMATION_CODE` - The confirmation code required to be able to edit user balances.
- `AUTOSAVE_INTERVAL` - How frequently the bot should save cached user data to the database (in seconds).

- `INITIAL_BALANCE` - The initial balance that new users should start with in each server.
- `MESSAGE_REWARD_FORMULA` - The formula to calculate the reward for sending messages.  The only variable currently supported is `%length%`.  The following operators are currently supported: `+-*/`.  (i.e. `%length% * 3`)
- `DAILY_MIN` - The minimum reward to grant users when running `/daily`.
- `DAILY_MAX` - The maximum reward to grant users when running `/daily`.
