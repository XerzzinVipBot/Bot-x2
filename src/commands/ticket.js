const { SlashCommandBuilder } = require('discord.js');
const { createTicket } = require('../services/ticket');

const command = new SlashCommandBuilder()
  .setName('ticket')
  .setDescription('Crea un ticket privado para soporte.')
  .setDMPermission(false);

async function execute(interaction) {
  await createTicket(interaction);
}

module.exports = {
  data: command,
  execute,
};
