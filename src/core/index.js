require('dotenv').config();

const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { loadHandlers } = require('../handlers');
const { loadCommands } = require('../commands');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Registrar handlers una sola vez
loadHandlers(client);

client.once('ready', async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);

  try {
    await loadCommands(readyClient);
    console.log('✅ Comandos cargados.');
  } catch (error) {
    console.error('❌ Error cargando comandos:', error);
  }

  // Set presence to "Jugando a 𝐗𝐄𝐑𝐙𝐙𝐈𝐍 𝐕𝐈𝐏"
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

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error('Failed to login, verify your bot token.', error);
  process.exit(1);
});

module.exports = client;
