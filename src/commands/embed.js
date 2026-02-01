const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

function parseColor(input) {
  if (!input) return null;
  const normalized = input.trim().replace(/^0x/i, '#');
  if (!normalized.startsWith('#')) return null;
  const hex = normalized.slice(1);
  if (![3, 6].includes(hex.length) || !/^[0-9a-f]+$/i.test(hex)) {
    return null;
  }
  return `#${hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex}`;
}

const command = new SlashCommandBuilder()
  .setName('embed')
  .setDescription('Publica un embed personalizado.')
  .addStringOption((option) =>
    option
      .setName('titulo')
      .setDescription('Título del embed')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName('descripcion').setDescription('Descripción del embed').setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName('color')
      .setDescription('Color en formato hex (ejemplo: #5865F2)')
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName('iconurl')
      .setDescription('URL del ícono para mostrar junto al título')
      .setRequired(false)
  )
  .addChannelOption((option) =>
    option
      .setName('canal')
      .setDescription('Canal donde publicar el embed')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
  )
  .setDMPermission(false);

async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const titleRaw = interaction.options.getString('titulo', true);
    const descriptionRaw = interaction.options.getString('descripcion');
    const colorRaw = interaction.options.getString('color');
    const iconUrlRaw = interaction.options.getString('iconurl');
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

    const embed = new EmbedBuilder().setTimestamp();

    if (descriptionRaw) {
      embed.setDescription(descriptionRaw);
    }

    if (colorRaw) {
      const colorValue = parseColor(colorRaw);
      if (!colorValue) {
        await interaction.editReply('El color debe ser un valor hex válido (por ejemplo, #5865F2).');
        return;
      }
      embed.setColor(colorValue);
    } else {
      embed.setColor('#5865f2');
    }

    // Título + icono: si hay iconurl se usa como author (título con icono). Si no, se usa como título normal.
    if (iconUrlRaw) {
      const isValidUrl = /^https?:\/\//i.test(iconUrlRaw);
      if (!isValidUrl) {
        await interaction.editReply('La iconURL debe ser una URL válida que comience con http o https.');
        return;
      }
      embed.setAuthor({ name: titleRaw, iconURL: iconUrlRaw });
    } else {
      embed.setTitle(titleRaw);
    }

    await targetChannel.send({ embeds: [embed] });
    await interaction.editReply(`Embed publicado en ${targetChannel}.`);
  } catch (error) {
    console.error('Error creating custom embed:', error);
    await interaction.editReply('No se pudo crear el embed. Inténtalo de nuevo más tarde.');
  }
}

module.exports = {
  data: command,
  execute,
};
