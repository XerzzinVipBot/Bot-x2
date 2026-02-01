const { SlashCommandBuilder } = require('discord.js');
const { playSound, stopSound, voiceConnection } = require('../services/voice');

const playCommand = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Reproduce un sonido en el canal configurado.')
  .addStringOption((option) =>
    option.setName('nombre').setDescription('Nombre del sonido (archivo .mp3 en assets/sounds/)').setRequired(true)
  )
  .setDMPermission(false);

const stopCommand = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Detiene la reproducción de audio y vuelve al modo silencioso.')
  .setDMPermission(false);

async function executePlay(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const soundName = interaction.options.getString('nombre', true).trim();
    const voiceChannel = interaction.member?.voice?.channel;
    
    if (!voiceChannel) {
      await interaction.editReply('Debes estar en un canal de voz para usar este comando.');
      return;
    }

    const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID?.trim();
    const connection = voiceConnection();
    
    if (!connection || connection.state.status === 'destroyed') {
      const { connectToVoiceChannel } = require('../services/voice');
      await connectToVoiceChannel();
    }

    const updatedConnection = voiceConnection();
    if (!updatedConnection || updatedConnection.joinConfig.guildId !== voiceChannel.guild.id) {
      await interaction.editReply('No hay ninguna reproducción activa en este servidor.');
      return;
    }

    if (updatedConnection.joinConfig.channelId !== VOICE_CHANNEL_ID || voiceChannel.id !== VOICE_CHANNEL_ID) {
      await interaction.editReply(`Debes estar en el canal de voz configurado (<#${VOICE_CHANNEL_ID}>) para reproducir sonidos.`);
      return;
    }

    const message = await playSound(soundName);
    await interaction.editReply(message);
  } catch (error) {
    console.error('Error playing sound:', error);
    await interaction.editReply('No se pudo reproducir el sonido.');
  }
}

async function executeStop(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const voiceChannel = interaction.member?.voice?.channel;
    
    if (!voiceChannel) {
      await interaction.editReply('Debes estar en un canal de voz para usar este comando.');
      return;
    }

    const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID?.trim();
    const connection = voiceConnection();
    
    if (!connection || connection.joinConfig.guildId !== voiceChannel.guild.id) {
      await interaction.editReply('No hay ninguna reproducción activa.');
      return;
    }

    if (connection.joinConfig.channelId !== VOICE_CHANNEL_ID || voiceChannel.id !== VOICE_CHANNEL_ID) {
      await interaction.editReply(`Debes estar en el canal de voz configurado (<#${VOICE_CHANNEL_ID}>) para controlar la reproducción.`);
      return;
    }

    const message = await stopSound();
    await interaction.editReply(message);
  } catch (error) {
    console.error('Error stopping sound:', error);
    await interaction.editReply('No se pudo detener el sonido.');
  }
}

module.exports = {
  play: {
    data: playCommand,
    execute: executePlay,
  },
  stop: {
    data: stopCommand,
    execute: executeStop,
  },
};
