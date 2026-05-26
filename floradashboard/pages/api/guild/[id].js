// Retorna informações detalhadas de um servidor específico.

import {
  getGuild,
  getGuildChannels,
  getGuildRoles,
  getGuildBans,
  getGuildInvites,
  guildIconUrl,
} from "../../../lib/discord";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  if (!id || !/^\d+$/.test(id)) return res.status(400).json({ error: "ID de guild inválido" });

  try {
    // Busca em paralelo: guild + canais + cargos (bans/invites podem falhar por permissão)
    const [guild, channels, roles, bans, invites] = await Promise.allSettled([
      getGuild(id),
      getGuildChannels(id),
      getGuildRoles(id),
      getGuildBans(id),
      getGuildInvites(id),
    ]);

    if (guild.status === "rejected") {
      return res.status(404).json({ error: "Guild não encontrada ou bot não está nela" });
    }

    const g = guild.value;
    const ch = channels.status === "fulfilled" ? channels.value : [];
    const rl = roles.status === "fulfilled" ? roles.value : [];
    const bn = bans.status === "fulfilled" ? bans.value : [];
    const iv = invites.status === "fulfilled" ? invites.value : [];

    // Agrupa canais por tipo
    const channelTypes = {
      text:     ch.filter((c) => c.type === 0).length,
      voice:    ch.filter((c) => c.type === 2).length,
      category: ch.filter((c) => c.type === 4).length,
      forum:    ch.filter((c) => c.type === 15).length,
      stage:    ch.filter((c) => c.type === 13).length,
      thread:   ch.filter((c) => [10, 11, 12].includes(c.type)).length,
    };

    // Canais de anúncio e notícias
    const announcementChannels = ch.filter((c) => c.type === 5);

    // Top 5 cargos (por posição, excluindo @everyone)
    const topRoles = rl
      .filter((r) => r.name !== "@everyone")
      .sort((a, b) => b.position - a.position)
      .slice(0, 10)
      .map((r) => ({
        id:       r.id,
        name:     r.name,
        color:    r.color ? `#${r.color.toString(16).padStart(6, "0")}` : null,
        position: r.position,
        managed:  r.managed,
        hoist:    r.hoist,
        perms:    r.permissions,
      }));

    const payload = {
      // Identificação
      id:          g.id,
      name:        g.name,
      icon:        guildIconUrl(g.id, g.icon, 256),
      banner:      g.banner ? `https://cdn.discordapp.com/banners/${g.id}/${g.banner}.png?size=512` : null,
      splash:      g.splash ? `https://cdn.discordapp.com/splashes/${g.id}/${g.splash}.png?size=512` : null,
      description: g.description,

      // Owner
      ownerId:     g.owner_id,

      // Membros
      memberCount:  g.approximate_member_count || g.member_count,
      onlineCount:  g.approximate_presence_count,

      // Canais
      totalChannels: ch.length,
      channelTypes,
      announcementChannels: announcementChannels.map((c) => ({ id: c.id, name: c.name })),

      // Cargos
      roleCount: rl.length,
      topRoles,

      // Bans
      banCount: bn.length,

      // Invites
      inviteCount: iv.length,
      activeInvites: iv.slice(0, 5).map((i) => ({
        code:     i.code,
        uses:     i.uses,
        maxUses:  i.max_uses,
        inviter:  i.inviter?.username,
        channel:  i.channel?.name,
      })),

      // Boost
      boostLevel:    g.premium_tier,
      boostCount:    g.premium_subscription_count,
      boosterRole:   g.premium_progress_bar_enabled,

      // Configurações
      verifyLevel:   g.verification_level,
      explicitFilter: g.explicit_content_filter,
      mfaLevel:      g.mfa_level,
      nsfwLevel:     g.nsfw_level,
      features:      g.features || [],
      locale:        g.preferred_locale,
      afkTimeout:    g.afk_timeout,

      // Emojis & Stickers
      emojiCount:   (g.emojis || []).length,
      stickerCount: (g.stickers || []).length,

      // Data de criação
      createdAt: snowflakeToDate(g.id),
      fetchedAt: new Date().toISOString(),
    };

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(200).json(payload);
  } catch (err) {
    console.error(`[/api/guild/${id}]`, err.message);
    res.status(500).json({ error: err.message });
  }
}

function snowflakeToDate(id) {
  const ms = (BigInt(id) >> 22n) + 1420070400000n;
  return new Date(Number(ms)).toISOString();
}