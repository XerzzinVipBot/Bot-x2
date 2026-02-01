const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    const GUILD_ID = process.env.GUILD_ID?.trim();
    
    if (!GUILD_ID) {
      throw new Error('GUILD_ID no está configurado');
    }

    // Asegurar que existe configuración para el guild
    const guildSetting = await prisma.guildSetting.upsert({
      where: { guildId: GUILD_ID },
      update: {},
      create: {
        guildId: GUILD_ID,
        locale: 'es',
      },
    });

    console.log('✅ Base de datos inicializada para el guild:', GUILD_ID);
    return guildSetting;
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  }
}

async function logActivity(actorId, action, metadata = null) {
  try {
    const GUILD_ID = process.env.GUILD_ID?.trim();
    
    await prisma.auditLog.create({
      data: {
        guildId: GUILD_ID,
        actorId,
        action,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('❌ Error registrando actividad:', error);
  }
}

module.exports = {
  prisma,
  initializeDatabase,
  logActivity,
};
