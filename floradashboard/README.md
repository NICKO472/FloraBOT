# 🌸 Flora Dashboard

Dashboard do FloraBOT — construída com Next.js 14 + React 18.

## Funcionalidades

- **Visão Geral** — Stats em tempo real: guilds, usuários, ping, uptime, memória
- **Feed de Eventos Live** — Todos os 40+ eventos do discord.js monitorados
- **Comandos** — Analytics de uso por categoria e por comando
- **Economia** — Ranking de riqueza, carteiras e banco
- **Níveis / XP** — Leaderboard do sistema de XP
- **Música** — Fila atual e informações do discord-player
- **Servidores** — Lista de guilds com Flora
- **Logs** — Console de erros, warnings e eventos do sistema

## Como rodar

```bash
cd floradashboard
npm install
npm run dev
```

Acesse: http://localhost:3000

## Conectar ao bot

Edite `pages/api/stats.js` para apontar para o seu bot via:
- WebSocket (recomendado para real-time)
- Express API no bot
- Banco de dados compartilhado (quick.db / MongoDB)

## Eventos Discord.js monitorados

messageCreate, messageDelete, messageUpdate, messageReactionAdd,
messageReactionRemove, interactionCreate, guildCreate, guildDelete,
guildMemberAdd, guildMemberRemove, guildMemberUpdate, guildBanAdd,
guildBanRemove, channelCreate, channelDelete, channelUpdate,
roleCreate, roleDelete, roleUpdate, emojiCreate, emojiDelete,
stickerCreate, stickerDelete, inviteCreate, inviteDelete,
voiceStateUpdate, presenceUpdate, typingStart, userUpdate,
threadCreate, threadDelete, threadUpdate, threadMemberUpdate,
guildScheduledEventCreate, guildScheduledEventUpdate,
stageInstanceCreate, ready, warn, shardReady, shardDisconnect,
shardReconnecting (40+ events!)