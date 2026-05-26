// pages/api/stats.js
// Conecte ao seu bot via IPC, WebSocket ou DB para retornar dados reais

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  // Exemplo: substituir com dados reais do cliente Discord.js via shared DB/IPC
  res.status(200).json({
    guilds: 128,
    users: 24871,
    channels: 4432,
    uptime: process.uptime(),
    ping: 42,
    memory: process.memoryUsage().heapUsed / 1024 / 1024,
    commandsToday: 3847,
    messagesHandled: 29430,
    events: 1284930,
    version: "2.0.0",
    botTag: "Flora#1234",
    botId: process.env.CLIENT_ID || "1507178107738525746",
  });
}