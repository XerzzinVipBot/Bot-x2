const { Events } = require('discord.js');
const { executeCommand } = require('../commands');

async function loadHandlers(client) {
  // Handler para interacciones (slash commands)
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.guild) return;
    if (!interaction.isChatInputCommand()) return;

    try {
      await executeCommand(interaction);
    } catch (error) {
      console.error('❌ Error handling interaction:', error);
      
      if (!interaction.replied) {
        try {
          await interaction.reply({
            content: 'Hubo un error al procesar tu comando. Por favor, intenta de nuevo.',
            ephemeral: true,
          });
        } catch (replyError) {
          console.error('❌ No se pudo notificar el error al usuario:', replyError);
        }
      }
    }
  });

  // Handler para errores del cliente
  client.on('error', (error) => {
    console.error('❌ Discord client error:', error);
  });

  // Handler para errores de shard
  client.on('shardError', (error) => {
    console.error('❌ Shard error:', error);
  });

  // Handler para rechazos no manejados
  process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled promise rejection:', reason);
  });

  console.log('✅ Handlers cargados exitosamente');
}

module.exports = {
  loadHandlers,
};
