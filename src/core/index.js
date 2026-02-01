require('dotenv').config();

const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { loadHandlers } = require('../handlers');
const { loadCommands } = require('../commands');
const { initializeDatabase } = require('../services/database');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Bot único; no iniciar bot 2

async function startBot() {
  try {
    // Inicializar base de datos
    await initializeDatabase();

    // Cargar handlers y comandos
    await loadHandlers(client);
    await loadCommands(client);

    console.log(`✅ Bot AURA HAX iniciado como ${client.user.tag}`);
  } catch (error) {
    console.error('❌ Error al iniciar el bot:', error);
    process.exit(1);
  }
}

client.once('ready', async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);

  await startBot();

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

  // Sin conexión a voz ni tareas promocionales
});

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error('Failed to login, verify your bot token.', error);
  process.exit(1);
});

module.exports = client;
