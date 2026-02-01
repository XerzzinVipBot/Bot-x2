const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const NAMED_COLORS = {
  rojo: '#ff0000',
  red: '#ff0000',
  naranja: '#ff7f11',
  orange: '#ff7f11',
  amarillo: '#ffda0a',
  yellow: '#ffda0a',
  verde: '#22c55e',
  green: '#22c55e',
  azul: '#1d4ed8',
  blue: '#1d4ed8',
  celeste: '#0ea5e9',
  cyan: '#0ea5e9',
  turquesa: '#14b8a6',
  morado: '#7c3aed',
  purple: '#7c3aed',
  violeta: '#7c3aed',
  rosa: '#ec4899',
  pink: '#ec4899',
  negro: '#111827',
  black: '#111827',
  gris: '#6b7280',
  gray: '#6b7280',
  grisoscuro: '#374151',
  blanco: '#f9fafb',
  white: '#f9fafb',
};

function normalizeText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function parseColor(input) {
  if (!input) return null;

  const trimmed = input.trim();
  const hexCandidate = trimmed.replace(/^0x/i, '#');

  if (hexCandidate.startsWith('#')) {
    const hex = hexCandidate.slice(1);
    if ([3, 6].includes(hex.length) && /^[0-9a-f]+$/i.test(hex)) {
      return `#${hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex}`;
    }
    return null;
  }

  const normalized = normalizeText(trimmed);
  return NAMED_COLORS[normalized] ?? null;
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
      .setDescription('Color (hex como #5865F2 o nombre: rojo, azul, amarillo, etc.)')
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
        await interaction.editReply(
          'El color debe ser un valor hex válido (por ejemplo, #5865F2) o uno de: rojo, naranja, amarillo, verde, azul, celeste, turquesa, morado, rosa, negro, gris, blanco.'
        );
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
