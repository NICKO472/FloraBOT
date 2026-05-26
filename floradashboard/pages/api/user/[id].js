// pages/api/user/[id].js
// Busca informações de um usuário Discord pelo ID (rota pública + dados globais).

import { discordFetch, avatarUrl } from "../../../lib/discord";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  if (!id || !/^\d+$/.test(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    // GET /users/{id} retorna info pública do usuário (avatar, banner, badges)
    const user = await discordFetch(`/users/${id}`);

    const banner = user.banner
      ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith("a_") ? "gif" : "png"}?size=512`
      : null;

    // Decodifica Public Flags para badges
    const badges = decodeFlags(user.public_flags || 0);

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({
      id:            user.id,
      username:      user.username,
      discriminator: user.discriminator,
      globalName:    user.global_name,
      avatar:        avatarUrl(user.id, user.avatar, 256),
      banner,
      accentColor:   user.accent_color
        ? `#${user.accent_color.toString(16).padStart(6, "0")}`
        : null,
      bot:           user.bot || false,
      system:        user.system || false,
      publicFlags:   user.public_flags || 0,
      badges,
      createdAt:     snowflakeToDate(user.id),
    });
  } catch (err) {
    console.error(`[/api/user/${id}]`, err.message);
    res.status(500).json({ error: err.message });
  }
}

function snowflakeToDate(id) {
  const ms = (BigInt(id) >> 22n) + 1420070400000n;
  return new Date(Number(ms)).toISOString();
}

const FLAG_MAP = {
  1:        "Discord Staff",
  2:        "Partnered Server Owner",
  4:        "HypeSquad Events",
  8:        "Bug Hunter Level 1",
  64:       "HypeSquad Bravery",
  128:      "HypeSquad Brilliance",
  256:      "HypeSquad Balance",
  512:      "Early Supporter",
  16384:    "Bug Hunter Level 2",
  131072:   "Verified Bot Developer",
  4194304:  "Active Developer",
};

function decodeFlags(flags) {
  return Object.entries(FLAG_MAP)
    .filter(([bit]) => flags & Number(bit))
    .map(([, name]) => name);
}