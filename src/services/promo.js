const { EmbedBuilder } = require('discord.js');

function buildHourlyPromoEmbed() {
  const PROMO_IMAGE_URL = process.env.PROMO_IMAGE_URL?.trim();

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setAuthor({
      name: '🔴 AURA HAX - Tienda Oficial',
      iconURL: 'https://media.discordapp.net/attachments/1461000295814267124/1466688323019083850/Gemini_Generated_Image_69mrel69mrel69mr.png?ex=697da771&is=697c55f1&hm=a24cec97861685a0ad42bc50d5028f16d4057f62f41dbc6632e9000ff312f736&=&format=webp&quality=lossless&width=768&height=768',
    })
    .setDescription('🎟️ **¡Realiza tus compras únicamente en el canal de tickets!**\n🛎️ Usa **/ticket** para abrir uno con el staff.')
    .addFields(
      {
        name: '🛡️ Garantía',
        value: '- Productos verificados\n- Soporte 24/7\n- Entrega inmediata',
        inline: true,
      },
      {
        name: '💳 Métodos de pago',
        value: '• PayPal\n• Transferencia',
        inline: true,
      },
      {
        name: '🕒 Horario',
        value: '• Disponible 24/7\n- Respuesta rápida\n- Atención personalizada',
      }
    )
    .setImage('https://media.discordapp.net/attachments/1464150603524608092/1465931866703134809/Banner.png?ex=697ae6f0&is=69799570&hm=120b784d241efc13edb36d94beee859a6a214fc9bc364aa3fe480e8e81c7e2c1&=&format=webp&quality=lossless&width=1020&height=588')
    .setFooter({
      text: 'AURA HAX · Compras seguras y confiables',
      iconURL: 'https://media.discordapp.net/attachments/1461000295814267124/1466688323019083850/Gemini_Generated_Image_69mrel69mrel69mr.png?ex=697da771&is=697c55f1&hm=a24cec97861685a0ad42bc50d5028f16d4057f62f41dbc6632e9000ff312f736&=&format=webp&quality=lossless&width=768&height=768',
    })
    .setTimestamp();

  if (PROMO_IMAGE_URL) {
    embed.setImage(PROMO_IMAGE_URL);
  }

  return embed;
}

async function sendHourlyPromoMessage(channel) {
  try {
    const embed = buildHourlyPromoEmbed();
    await channel.send({ content: '||@everyone|| ||@here||', embeds: [embed] });
  } catch (error) {
    console.error('Error enviando mensaje promocional:', error);
  }
}

async function scheduleHourlyPromo(client) {
  const GENERAL_CHANNEL_ID = process.env.GENERAL_CHANNEL_ID?.trim();
  const FALLBACK_GENERAL_CHANNEL_ID = 'REPLACE_WITH_GENERAL_CHANNEL_ID';
  const DEFAULT_PROMO_INTERVAL_MS = 30 * 60 * 1000;
  const PROMO_MESSAGE_INTERVAL_MINUTES = process.env.PROMO_MESSAGE_INTERVAL_MINUTES?.trim();
  
  const promoIntervalMinutes = Number(PROMO_MESSAGE_INTERVAL_MINUTES ?? DEFAULT_PROMO_INTERVAL_MS / 60_000);
  const PROMO_INTERVAL_MS = Number.isFinite(promoIntervalMinutes) && promoIntervalMinutes > 0
    ? promoIntervalMinutes * 60_000
    : DEFAULT_PROMO_INTERVAL_MS;

  let promoInterval;

  if (!GENERAL_CHANNEL_ID || GENERAL_CHANNEL_ID === FALLBACK_GENERAL_CHANNEL_ID) {
    console.warn('GENERAL_CHANNEL_ID no está configurado; se omiten los mensajes promocionales.');
    return;
  }

  try {
    const channel = await client.channels.fetch(GENERAL_CHANNEL_ID);

    if (!channel || channel.type !== 0) { // GuildText
      console.warn('GENERAL_CHANNEL_ID no apunta a un canal de texto válido; se omiten los mensajes promocionales.');
      return;
    }

    await sendHourlyPromoMessage(channel);

    if (promoInterval) {
      clearInterval(promoInterval);
    }

    promoInterval = setInterval(() => {
      sendHourlyPromoMessage(channel);
    }, PROMO_INTERVAL_MS);

    console.log(`Mensajes promocionales programados cada ${PROMO_INTERVAL_MS / 60_000} minutos en ${channel.id}.`);
  } catch (error) {
    console.error('No se pudo programar el mensaje promocional:', error);
  }
}

module.exports = {
  buildHourlyPromoEmbed,
  sendHourlyPromoMessage,
  scheduleHourlyPromo,
};
