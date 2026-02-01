const { ActivityType } = require('discord.js');

module.exports = {
  DEFAULT_PROMO_INTERVAL_MS: 30 * 60 * 1000,
  BOT_STATUS: 'online',
  BOT_ACTIVITIES: [
    {
      name: 'Jugando AURA HAX',
      type: ActivityType.Playing,
    },
  ],
  COLORS: {
    SUCCESS: '#00ff00',
    ERROR: '#ff0000',
    WARNING: '#ff9900',
    INFO: '#5865f2',
    PROMO: '#00FF00',
  },
  PERMISSIONS: {
    VIEW_CHANNEL: 'ViewChannel',
    SEND_MESSAGES: 'SendMessages',
    READ_MESSAGE_HISTORY: 'ReadMessageHistory',
    MANAGE_MESSAGES: 'ManageMessages',
    MANAGE_GUILD: 'ManageGuild',
  },
};
