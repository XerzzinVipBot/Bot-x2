const DISCORD_TOKEN = process.env.DISCORD_TOKEN?.trim();
const GUILD_ID = process.env.GUILD_ID?.trim();
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID?.trim();
const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID?.trim() || null;
const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID?.trim() || null;
const GENERAL_CHANNEL_ID = process.env.GENERAL_CHANNEL_ID?.trim() || null;
const PROMO_IMAGE_URL = process.env.PROMO_IMAGE_URL?.trim() || null;
const PROMO_MESSAGE_INTERVAL_MINUTES = process.env.PROMO_MESSAGE_INTERVAL_MINUTES?.trim();

const FALLBACK_VOICE_CHANNEL_ID = 'REPLACE_WITH_VOICE_CHANNEL_ID';
const FALLBACK_GENERAL_CHANNEL_ID = 'REPLACE_WITH_GENERAL_CHANNEL_ID';

if (!DISCORD_TOKEN || !GUILD_ID) {
  throw new Error(
    'Missing Discord configuration. Define DISCORD_TOKEN y GUILD_ID en variables de entorno.'
  );
}

module.exports = {
  DISCORD_TOKEN,
  GUILD_ID,
  VOICE_CHANNEL_ID,
  TICKET_CATEGORY_ID,
  ADMIN_ROLE_ID,
  GENERAL_CHANNEL_ID,
  PROMO_IMAGE_URL,
  PROMO_MESSAGE_INTERVAL_MINUTES,
  FALLBACK_VOICE_CHANNEL_ID,
  FALLBACK_GENERAL_CHANNEL_ID,
};
