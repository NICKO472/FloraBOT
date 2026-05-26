// pages/api/bot.js
// Retorna informações reais do bot via Discord REST API.
// Nunca expõe o token ao cliente — roda apenas no servidor Next.js.

import { getBotUser, getApplication, getGateway, getBotGuilds, avatarUrl } from "../../lib/discord";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    // Todas as chamadas em paralelo para mínima latência
    const [botUser, application, gateway, guilds] = await Promise.all([
      getBotUser(),
      getApplication().catch(() => null),   // pode falhar se não for aplicação
      getGateway().catch(() => null),
      getBotGuilds().catch(() => []),
    ]);

    // Conta total de membros a partir dos campos approximados da guild list
    const totalMembers = guilds.reduce((acc, g) => acc + (g.approximate_member_count || 0), 0);
    const totalOnline  = guilds.reduce((acc, g) => acc + (g.approximate_presence_count || 0), 0);

    // Distribuição de features
    const featureCounts = {};
    guilds.forEach((g) => {
      (g.features || []).forEach((f) => {
        featureCounts[f] = (featureCounts[f] || 0) + 1;
      });
    });

    const payload = {
      // ── Usuário do bot ──────────────────────────────────────
      id:            botUser.id,
      username:      botUser.username,
      discriminator: botUser.discriminator,
      globalName:    botUser.global_name || botUser.username,
      avatar:        avatarUrl(botUser.id, botUser.avatar, 256),
      verified:      botUser.verified,
      bot:           botUser.bot,
      publicFlags:   botUser.public_flags,

      // ── Aplicação ───────────────────────────────────────────
      appName:             application?.name,
      appDescription:      application?.description,
      approximateGuildCount: application?.approximate_guild_count || guilds.length,

      // ── Shards / Gateway ───────────────────────────────────
      shards:           gateway?.shards ?? 1,
      sessionStartLimit: gateway?.session_start_limit ?? null,

      // ── Estatísticas dos Servidores ─────────────────────────
      guildCount:    guilds.length,
      totalMembers,
      totalOnline,
      featureCounts,

      // ── Timestamp ──────────────────────────────────────────
      fetchedAt: new Date().toISOString(),
    };

    // Cache curto (30s) para não bater rate-limit do Discord
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(200).json(payload);
  } catch (err) {
    console.error("[/api/bot]", err.message);
    res.status(500).json({ error: err.message });
  }
}