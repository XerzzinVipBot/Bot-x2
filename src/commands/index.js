const fs = require('fs');
const path = require('path');

const commandsPath = path.join(__dirname);
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {
  if (file === 'index.js') continue;
  
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if (command.data && command.execute) {
    commands.push(command.data);
  }
}

async function loadCommands(client) {
  try {
    const GUILD_ID = process.env.GUILD_ID?.trim();
    
    if (!GUILD_ID) {
      throw new Error('GUILD_ID no está configurado');
    }

    const guild = client.guilds.cache.get(GUILD_ID) ?? (await client.guilds.fetch(GUILD_ID));
    
    if (guild) {
      await guild.commands.set(commands);
      console.log('✅ Slash commands registrados para el guild.');
    } else {
      console.warn('⚠️ No se pudo registrar los comandos porque el bot no está en el guild configurado.');
    }
  } catch (error) {
    console.error('❌ Error registrando slash commands:', error);
  }
}

async function executeCommand(interaction) {
  const commandName = interaction.commandName;
  
  for (const file of commandFiles) {
    if (file === 'index.js') continue;
    
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if (command.data?.name === commandName) {
      await command.execute(interaction);
      return;
    }
  }
  
  await interaction.reply({ content: 'Comando no reconocido.', ephemeral: true });
}

module.exports = {
  loadCommands,
  executeCommand,
};
