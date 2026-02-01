const embedCommand = require('./embed');

const commands = [embedCommand];

async function loadCommands(client) {
  try {
    const GUILD_ID = process.env.GUILD_ID?.trim();
    
    if (!GUILD_ID) {
      throw new Error('GUILD_ID no está configurado');
    }

    const guild = client.guilds.cache.get(GUILD_ID) ?? (await client.guilds.fetch(GUILD_ID));
    
    if (guild) {
      await guild.commands.set(commands.map((command) => command.data));
      console.log('✅ Slash commands registrados para el guild.');
    } else {
      console.warn('⚠️ No se pudo registrar los comandos porque el bot no está en el guild configurado.');
    }
  } catch (error) {
    console.error('❌ Error registrando slash commands:', error);
  }
}

async function executeCommand(interaction) {
  if (interaction.commandName === embedCommand.data.name) {
    await embedCommand.execute(interaction);
    return;
  }

  await interaction.reply({ content: 'Comando no reconocido.', ephemeral: true });
}

module.exports = {
  loadCommands,
  executeCommand,
};
