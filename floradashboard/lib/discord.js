// lib/discord.js
// Thin wrapper around the Discord REST API — server-side only, never exposed to the browser.

const BASE = "https://discord.com/api/v10";
const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
  console.warn("[Flora] DISCORD_TOKEN não definido em .env.local");
}

/**
 * Generic authenticated fetch against Discord REST.
 * Throws on non-2xx so callers can catch cleanly.
 */
export async function discordFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bot ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "FloraBOT Dashboard (discord.js v14)",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Discord API ${res.status} on ${path}: ${body}`);
  }

  return res.json();
}

// ── Endpoints ──────────────────────────────────────────────────────────────────

/** GET /users/@me — bot account info */
export const getBotUser = () => discordFetch("/users/@me");

/** GET /applications/@me — application info with approximate_guild_count */
export const getApplication = () => discordFetch("/applications/@me");

/** GET /gateway/bot — shard info + session start limits */
export const getGateway = () => discordFetch("/gateway/bot");

/**
 * GET /users/@me/guilds — up to 200 guilds the bot is in.
 * Returns: id, name, icon, owner, permissions, features.
 */
export const getBotGuilds = () =>
  discordFetch("/users/@me/guilds?with_counts=true&limit=200");

/**
 * GET /guilds/{id}?with_counts=true
 * Returns full guild object including approximate_member_count + approximate_presence_count.
 */
export const getGuild = (id) =>
  discordFetch(`/guilds/${id}?with_counts=true`);

/**
 * GET /guilds/{id}/channels
 */
export const getGuildChannels = (id) =>
  discordFetch(`/guilds/${id}/channels`);

/**
 * GET /guilds/{id}/members?limit=1000
 * Requires GuildMembers intent to be enabled on the bot.
 */
export const getGuildMembers = (id, limit = 100) =>
  discordFetch(`/guilds/${id}/members?limit=${limit}`);

/**
 * GET /guilds/{id}/roles
 */
export const getGuildRoles = (id) =>
  discordFetch(`/guilds/${id}/roles`);

/**
 * GET /guilds/{id}/bans — requires BanMembers permission.
 */
export const getGuildBans = (id) =>
  discordFetch(`/guilds/${id}/bans?limit=100`);

/**
 * GET /guilds/{id}/invites
 */
export const getGuildInvites = (id) =>
  discordFetch(`/guilds/${id}/invites`);

/**
 * Build a CDN avatar URL for a user.
 * Falls back to the default Discord avatar when no hash is present.
 */
export function avatarUrl(userId, hash, size = 128) {
  if (!hash) {
    const disc = Number(userId) % 5;
    return `https://cdn.discordapp.com/embed/avatars/${disc}.png`;
  }
  const ext = hash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${ext}?size=${size}`;
}

/**
 * Build a CDN icon URL for a guild.
 */
export function guildIconUrl(guildId, hash, size = 128) {
  if (!hash) return null;
  const ext = hash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guildId}/${hash}.${ext}?size=${size}`;
}

/**
 * Format bytes into a human-readable string.
 */
export function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}