const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const command = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Muestra todos los comandos disponibles del bot.')
  .setDMPermission(false);

async function execute(interaction) {
  const commands = [
    '/ticket - Crea un ticket privado para soporte',
    '/close - Cierra el ticket actual. Solo staff o creador',
    '/voiceconnect - Conecta los bots al canal de voz',
    '/embed - Publica un embed personalizado',
    '/ticketpanel - Publica el panel informativo de tickets en un canal',
    '/play - Reproduce un sonido en el canal configurado',
    '/stop - Detiene la reproducción de audio y vuelve al modo silencioso',
    '/help - Muestra todos los comandos disponibles del bot',
  ];

  const embed = new EmbedBuilder()
    .setColor('#5865f2')
    .setTitle('📋 Comandos disponibles')
    .setDescription(commands.join('\n'))
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = {
  data: command,
  execute,
};
