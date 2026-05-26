// pages/api/guilds.js
// Retorna a lista completa de servidores onde o bot está,
// incluindo contagens de membros e ícones CDN.

import { getBotGuilds, getGuild, guildIconUrl } from "../../lib/discord";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { detail } = req.query; // ?detail=true busca dados completos de cada guild

  try {
    const guilds = await getBotGuilds();

    let enriched;

    if (detail === "true") {
      // Busca detalhes completos (member count real) — mais lento, use com moderação
      // Limitado a 10 guilds para não explodir o rate limit
      const sample = guilds.slice(0, 10);
      const details = await Promise.allSettled(sample.map((g) => getGuild(g.id)));

      enriched = guilds.map((g, i) => {
        const det = i < 10 && details[i].status === "fulfilled" ? details[i].value : null;
        return formatGuild(g, det);
      });
    } else {
      enriched = guilds.map((g) => formatGuild(g, null));
    }

    // Ordena por membros (maior primeiro)
    enriched.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.status(200).json({ guilds: enriched, total: enriched.length });
  } catch (err) {
    console.error("[/api/guilds]", err.message);
    res.status(500).json({ error: err.message });
  }
}

function formatGuild(basic, detail) {
  const g = detail || basic;
  return {
    id:           g.id,
    name:         g.name,
    icon:         guildIconUrl(g.id, g.icon),
    iconHash:     g.icon,
    owner:        basic.owner ?? false,
    ownerId:      g.owner_id ?? null,
    memberCount:  g.approximate_member_count || g.member_count || null,
    onlineCount:  g.approximate_presence_count || null,
    features:     g.features || [],
    // Canais e cargos só disponíveis na rota detalhada
    channelCount: detail?.channels?.length ?? null,
    roleCount:    detail?.roles?.length ?? null,
    boostLevel:   g.premium_tier ?? null,
    boostCount:   g.premium_subscription_count ?? null,
    verifyLevel:  g.verification_level ?? null,
    description:  g.description ?? null,
    banner:       g.banner ?? null,
    splash:       g.splash ?? null,
    createdAt:    snowflakeToDate(g.id),
  };
}

/** Converte Snowflake Discord → Date */
function snowflakeToDate(id) {
  const ms = (BigInt(id) >> 22n) + 1420070400000n;
  return new Date(Number(ms)).toISOString();
}