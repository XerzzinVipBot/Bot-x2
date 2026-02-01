const {
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
} = require('@discordjs/voice');
const { Readable } = require('node:stream');
const { StreamType } = require('@discordjs/voice');

let voiceConnection;
let audioPlayer;
let silenceResource;

class SilenceStream extends Readable {
  _read() {
    this.push(Buffer.from([0xf8, 0xff, 0xfe]));
  }
}

async function connectToVoiceChannel() {
  try {
    const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID?.trim();
    const GUILD_ID = process.env.GUILD_ID?.trim();
    
    if (!VOICE_CHANNEL_ID || !GUILD_ID) {
      throw new Error('VOICE_CHANNEL_ID y GUILD_ID deben estar configurados');
    }

    const { client } = require('../core');
    const guild = await client.guilds.fetch(GUILD_ID);
    const channel = await guild.channels.fetch(VOICE_CHANNEL_ID);

    if (!channel || !channel.isVoiceBased()) {
      throw new Error('VOICE_CHANNEL_ID debe apuntar a un canal de voz válido.');
    }

    console.log(`🔊 Canal encontrado: ${channel.name}`);

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    voiceConnection = connection;

    connection.on('stateChange', (oldState, newState) => {
      if (newState.status === VoiceConnectionStatus.Ready) {
        console.log('✅ AURA HAX conectado al canal');
      } else {
        console.log(`🔊 Estado: ${oldState.status} -> ${newState.status}`);
      }
    });

    connection.on('error', (error) => {
      console.error('Voice error:', error.message);
    });

    audioPlayer = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    });

    audioPlayer.on('error', (error) => {
      console.error('Audio error:', error);
    });

    try {
      silenceResource = createAudioResource(new SilenceStream(), {
        inputType: StreamType.Raw,
      });
      audioPlayer.play(silenceResource);
      connection.subscribe(audioPlayer);
    } catch (audioError) {
      console.warn('No audio stream:', audioError.message);
    }

    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    console.log('✅✅✅ AURA HAX LISTO EN VOZ ✅✅✅');

    connection.on('stateChange', async (oldState, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        try {
          await entersState(connection, VoiceConnectionStatus.Connecting, 5_000);
        } catch (err) {
          connectToVoiceChannel().catch(console.error);
        }
      }
    });
  } catch (error) {
    console.error('Connect error:', error.message);
  }
}

async function playSound(soundName) {
  try {
    if (!audioPlayer) {
      throw new Error('Audio player no inicializado.');
    }

    const path = require('path');
    const fs = require('fs');
    const soundPath = path.join(__dirname, '../../assets/sounds', `${soundName}.mp3`);

    if (!fs.existsSync(soundPath)) {
      throw new Error(`No se encontró el sonido "${soundName}".`);
    }

    const resource = createAudioResource(soundPath);
    audioPlayer.removeAllListeners('idle');
    audioPlayer.play(resource);

    audioPlayer.once('idle', () => {
      if (silenceResource && audioPlayer.state.status !== 'playing') {
        audioPlayer.play(silenceResource);
      }
    });

    return `Reproduciendo: ${soundName}`;
  } catch (error) {
    console.error('Error playing sound:', error);
    throw error;
  }
}

function stopSound() {
  try {
    if (!audioPlayer || !silenceResource) {
      throw new Error('Audio player no inicializado.');
    }

    audioPlayer.stop();
    if (silenceResource) {
      audioPlayer.play(silenceResource);
    }

    return 'La reproducción ha sido detenida.';
  } catch (error) {
    console.error('Error stopping sound:', error);
    throw error;
  }
}

module.exports = {
  connectToVoiceChannel,
  playSound,
  stopSound,
  voiceConnection: () => voiceConnection,
  audioPlayer: () => audioPlayer,
};
