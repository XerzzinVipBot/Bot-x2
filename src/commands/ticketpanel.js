const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const command = new SlashCommandBuilder()
  .setName('ticketpanel')
  .setDescription('Publica el panel informativo de tickets en un canal.')
  .addChannelOption((option) =>
    option
      .setName('canal')
      .setDescription('Canal donde publicar el panel')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
  )
  .setDMPermission(false);

async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID?.trim();
    const targetChannel = interaction.options.getChannel('canal') ?? interaction.channel;

    if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
      await interaction.editReply('El canal objetivo debe ser un canal de texto.');
      return;
    }

    const me = interaction.guild.members.me;
    if (!me || !targetChannel.permissionsFor(me).has(PermissionFlagsBits.SendMessages)) {
      await interaction.editReply('No tengo permisos para enviar mensajes en ese canal.');
      return;
    }

    const ticketInstructions = TICKET_CATEGORY_ID
      ? `Usa **/ticket** para crear un ticket. Los tickets se organizarán en la categoría <#${TICKET_CATEGORY_ID}>.`
      : 'Usa **/ticket** para crear un ticket privado con el staff.';

    const embed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle('🎫 Centro de Tickets')
      .setDescription(ticketInstructions)
      .addFields(
        {
          name: 'Cómo cerrar un ticket',
          value: 'Dentro del canal del ticket escribe **/close** cuando quieras finalizar la conversación.',
        },
        {
          name: 'Embeds personalizados',
          value: 'Los moderadores pueden usar **/embed** para dar avisos importantes.',
        },
        {
          name: 'Sonidos',
          value: 'Usa **/play nombre** para audio y **/stop** para detenerlo.',
        }
      )
      .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
      .setTimestamp();

    await targetChannel.send({ embeds: [embed] });

    const responseContent =
      targetChannel.id === interaction.channel?.id
        ? 'Panel de tickets publicado.'
        : `Panel de tickets publicado en ${targetChannel}.`;

    await interaction.editReply(responseContent);
  } catch (error) {
    console.error('Error sending ticket panel embed:', error);
    await interaction.editReply('No se pudo enviar el panel de tickets. Inténtalo de nuevo más tarde.');
  }
}

module.exports = {
  data: command,
  execute,
};
