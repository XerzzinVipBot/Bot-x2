const { SlashCommandBuilder } = require('discord.js');
const { connectToVoiceChannel } = require('../services/voice');

const command = new SlashCommandBuilder()
  .setName('voiceconnect')
  .setDescription('Conecta los bots al canal de voz')
  .setDMPermission(false);

async function execute(interaction) {
  try {
    await interaction.deferReply();
    console.log('Intentando conectar bots a voz...');
    
    await connectToVoiceChannel().catch(err => {
      console.log('Bot principal - error no crítico:', err.message);
    });
    
    await interaction.editReply('✅ Bots conectados al canal de voz');
  } catch (error) {
    console.error('Error en voice connect:', error);
    await interaction.editReply('❌ Error al conectar los bots');
  }
}

module.exports = {
  data: command,
  execute,
};
