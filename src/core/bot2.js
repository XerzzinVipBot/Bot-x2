require('dotenv').config();

const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once('ready', (readyClient) => {
  console.log(`Bot 2 listo: ${readyClient.user.tag}`);
  
  readyClient.user.setPresence({
    activities: [
      {
        name: '𝐗𝐄𝐑𝐙𝐙𝐈𝐍 𝐕𝐈𝐏',
        type: ActivityType.Playing,
      },
    ],
    status: 'online',
  });
});

client.login(process.env.DISCORD_TOKEN_2).catch((error) => {
  console.error('Bot 2 - Failed to login:', error.message);
});

module.exports = client;
