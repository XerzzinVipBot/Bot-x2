# Estructura del Proyecto - Versión 2.0

## Organización Profesional por Módulos

```
Aura Hax Bot/
├── src/
│   ├── core/                 # Lógica principal del bot
│   │   ├── index.js         # Punto de entrada principal
│   │   └── bot2.js          # Bot secundario
│   ├── commands/             # Comandos slash (separados por funcionalidad)
│   │   ├── index.js         # Exportador y cargador de comandos
│   │   ├── ticket.js        # Sistema de tickets
│   │   ├── close.js         # Cierre de tickets
│   │   ├── voiceconnect.js  # Conexión de voz
│   │   ├── embed.js         # Embeds personalizados
│   │   ├── ticketpanel.js   # Panel de tickets
│   │   ├── audio.js         # Comandos de audio (play/stop)
│   │   └── help.js          # Ayuda del bot
│   ├── services/             # Lógica de negocio y servicios
│   │   ├── database.js      # Servicio de base de datos
│   │   ├── ticket.js        # Servicio de tickets
│   │   ├── voice.js         # Servicio de voz
│   │   └── promo.js         # Servicio promocional
│   ├── handlers/             # Manejadores de eventos
│   │   └── index.js         # Manejador principal de interacciones
│   ├── config/               # Configuración centralizada
│   │   └── index.js         # Variables de entorno y configuración
│   ├── types/                # Constantes y tipos
│   │   └── constants.js     # Constantes del bot
│   ├── utils/                # Utilidades (vacío para futuras expansiones)
│   ├── generated/            # Archivos generados por Prisma
│   └── lib/                  # Librerías adicionales
├── assets/                   # Recursos del bot
│   ├── images/              # Imágenes, logos, banners
│   ├── sounds/              # Archivos de audio (.mp3)
│   └── templates/           # Plantillas de mensajes
├── config/                   # Configuración global
│   └── prisma.config.ts    # Configuración de Prisma
├── scripts/                  # Scripts de utilidad (vacío)
├── docs/                     # Documentación
│   └── STRUCTURE.md         # Este archivo
├── logs/
│   └── transcripts/         # Transcripciones de tickets
├── prisma/                   # Base de datos
│   ├── schema.prisma        # Esquema de la base de datos
│   ├── migrations/          # Migraciones
│   └── dev.db              # Base de datos local
├── dashboard/                # Dashboard web (Next.js)
└── node_modules/            # Dependencias
```

## Arquitectura y Flujo

### 1. Punto de Entrada (`src/core/index.js`)
- Inicializa el cliente de Discord
- Carga todos los handlers y comandos
- Configura la base de datos
- Inicia servicios de voz y promociones

### 2. Comandos (`src/commands/`)
- Cada comando en su propio archivo
- Separación clara de responsabilidades
- Exportación automática via `index.js`

### 3. Servicios (`src/services/`)
- Lógica de negocio reutilizable
- Separación de la lógica de los comandos
- Fácil testing y mantenimiento

### 4. Handlers (`src/handlers/`)
- Manejo centralizado de eventos
- Gestión de errores consistente
- Logging unificado

## Ventajas de esta Estructura

1. **Escalabilidad**: Fácil agregar nuevos comandos y servicios
2. **Mantenimiento**: Código organizado y modular
3. **Testing**: Cada módulo puede ser testeado independientemente
4. **Colaboración**: Múltiples desarrolladores pueden trabajar en diferentes módulos
5. **Reutilización**: Servicios pueden ser usados por múltiples comandos

## Comandos Disponibles

- `/ticket` - Crea un ticket de soporte
- `/close` - Cierra el ticket actual
- `/voiceconnect` - Conecta los bots a voz
- `/embed` - Crea embeds personalizados
- `/ticketpanel` - Publica panel de tickets
- `/play <nombre>` - Reproduce sonido
- `/stop` - Detiene reproducción
- `/help` - Muestra ayuda

## Variables de Entorno Requeridas

```env
DISCORD_TOKEN=token_del_bot_principal
DISCORD_TOKEN_2=token_del_bot_secundario
GUILD_ID=id_del_servidor
VOICE_CHANNEL_ID=id_canal_voz
TICKET_CATEGORY_ID=id_categoría_tickets
ADMIN_ROLE_ID=id_rol_admin
GENERAL_CHANNEL_ID=id_canal_general
PROMO_IMAGE_URL=url_imagen_promocional
PROMO_MESSAGE_INTERVAL_MINUTES=30
DATABASE_URL=postgresql://...
```

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Iniciar el bot
npm start
```

## Flujo de una Interacción

1. Usuario ejecuta un slash command
2. Handler captura la interacción
3. Command router dirige al comando específico
4. Comando utiliza servicios si es necesario
5. Respuesta enviada al usuario
6. Actividad registrada en base de datos
