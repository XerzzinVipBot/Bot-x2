const { prisma } = require('./database');
const { logActivity } = require('./database');

async function createTicket(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const GUILD_ID = process.env.GUILD_ID?.trim();
    const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID?.trim();
    const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID?.trim();

    const guild = interaction.guild;
    if (!guild) {
      await interaction.editReply('Este comando solo puede usarse dentro de un servidor.');
      return;
    }

    // Verificar si ya existe un ticket abierto para este usuario
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        guildId: GUILD_ID,
        userId: interaction.user.id,
        status: 'OPEN',
      },
    });

    if (existingTicket) {
      await interaction.editReply(`Ya tienes un ticket abierto: <#${existingTicket.channelId}>`);
      return;
    }

    const currentChannel = interaction.channel;
    if (TICKET_CATEGORY_ID && currentChannel?.parentId !== TICKET_CATEGORY_ID) {
      await interaction.editReply(
        `Este comando solo se puede usar en la categoría configurada <#${TICKET_CATEGORY_ID}>.`
      );
      return;
    }

    const ticketBaseName = interaction.user.username.toLowerCase().replace(/[^a-z0-9_-]/gi, '-');
    const ticketName = `ticket-${ticketBaseName}-${Date.now().toString(36)}`;

    const { ChannelType, PermissionFlagsBits } = require('discord.js');
    const permissionOverwrites = [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ];

    if (ADMIN_ROLE_ID) {
      permissionOverwrites.push({
        id: ADMIN_ROLE_ID,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
        ],
      });
    }

    const ticketChannel = await guild.channels.create({
      name: ticketName,
      type: ChannelType.GuildText,
      parent: TICKET_CATEGORY_ID || undefined,
      topic: `Ticket owner:${interaction.user.id}`,
      permissionOverwrites,
    });

    const { EmbedBuilder } = require('discord.js');
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🎫 Ticket Creado')
      .setDescription(`Hola ${interaction.user}, tu ticket ha sido creado. El staff te responderá pronto.`)
      .addFields(
        { name: 'Usuario', value: interaction.user.tag, inline: true },
        { name: 'ID', value: interaction.user.id, inline: true }
      )
      .setTimestamp();

    await ticketChannel.send({ embeds: [embed] });

    // Guardar ticket en la base de datos
    const ticket = await prisma.ticket.create({
      data: {
        guildId: GUILD_ID,
        userId: interaction.user.id,
        channelId: ticketChannel.id,
        status: 'OPEN',
        priority: 'MEDIUM',
      },
    });

    // Guardar mensaje inicial del ticket
    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: interaction.user.id,
        content: embed.toJSON().description || 'Ticket creado',
      },
    });

    // Registrar actividad
    await logActivity(interaction.user.id, 'TICKET_CREATED', {
      ticketId: ticket.id,
      channelId: ticketChannel.id,
    });

    await interaction.editReply(`Tu ticket ha sido creado en ${ticketChannel}.`);
  } catch (error) {
    console.error('Error creating ticket:', error);
    await interaction.editReply('No se pudo crear el ticket. Por favor, contacta a un administrador.');
  }
}

async function closeTicket(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const GUILD_ID = process.env.GUILD_ID?.trim();
    const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID?.trim();

    const channel = interaction.channel;
    if (!channel || channel.type !== 0) { // GuildText
      await interaction.editReply('Este comando solo se puede usar dentro de un canal de ticket.');
      return;
    }

    if (!channel.name.startsWith('ticket-')) {
      await interaction.editReply('Este comando solo se puede usar en canales de tickets.');
      return;
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const { PermissionFlagsBits } = require('discord.js');
    const isAdmin = ADMIN_ROLE_ID
      ? member.roles.cache.has(ADMIN_ROLE_ID)
      : member.permissions.has(PermissionFlagsBits.ManageGuild);
    
    const channelTopic = channel.topic || '';
    const ownerIdMatch = channelTopic.match(/Ticket owner:(\d+)/);
    const ownerId = ownerIdMatch ? ownerIdMatch[1] : null;
    const isTicketCreator = ownerId ? ownerId === interaction.user.id : channel.permissionOverwrites.cache.has(interaction.user.id);

    if (!isAdmin && !isTicketCreator) {
      await interaction.editReply('No tienes permisos para cerrar este ticket.');
      return;
    }

    const messages = await channel.messages.fetch({ limit: 100 });
    let transcript = `Transcript del ticket: ${channel.name}\n`;
    transcript += `Creado por: ${ownerId || 'desconocido'}\n`;
    transcript += `Cerrado por: ${interaction.user.tag}\n`;
    transcript += `Fecha: ${new Date().toLocaleString()}\n\n`;

    messages
      .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
      .forEach((msg) => {
        const content = msg.content || (msg.attachments.size > 0 ? '[Adjunto]' : '');
        transcript += `[${msg.createdAt.toLocaleString()}] ${msg.author.tag}: ${content}\n`;
      });

    const { EmbedBuilder } = require('discord.js');
    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle('🔒 Ticket Cerrado')
      .setDescription('Este ticket será cerrado en 5 segundos...')
      .addFields(
        { name: 'Cerrado por', value: interaction.user.tag, inline: true },
        { name: 'Canal', value: channel.name, inline: true }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    const path = require('path');
    const fs = require('fs');
    const transcriptsDir = path.join(__dirname, '../../logs/transcripts');
    
    try {
      if (!fs.existsSync(transcriptsDir)) {
        fs.mkdirSync(transcriptsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(transcriptsDir, `${channel.name}.txt`), transcript, 'utf8');
    } catch (writeError) {
      console.warn('No se pudo guardar el transcript:', writeError);
    }

    setTimeout(async () => {
      try {
        await prisma.ticket.updateMany({
          where: {
            guildId: GUILD_ID,
            channelId: channel.id,
          },
          data: {
            status: 'CLOSED',
          },
        });

        await channel.delete('Ticket cerrado');
      } catch (error) {
        console.error('Error deleting ticket channel:', error);
      }
    }, 5000);

    await logActivity(interaction.user.id, 'TICKET_CLOSED', {
      channelId: channel.id,
    });

    await interaction.editReply('Ticket cerrado. El canal se eliminará en 5 segundos.');
  } catch (error) {
    console.error('Error closing ticket:', error);
    await interaction.editReply('No se pudo cerrar el ticket. Por favor, contacta a un administrador.');
  }
}

module.exports = {
  createTicket,
  closeTicket,
};
