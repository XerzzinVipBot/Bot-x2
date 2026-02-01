const { SlashCommandBuilder } = require('discord.js');
const { closeTicket } = require('../services/ticket');

const command = new SlashCommandBuilder()
  .setName('close')
  .setDescription('Cierra el ticket actual. Solo staff o creador.')
  .setDMPermission(false);

async function execute(interaction) {
  await closeTicket(interaction);
}

module.exports = {
  data: command,
  execute,
};
