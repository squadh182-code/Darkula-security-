const {
  AuditLogEvent
} = require("discord.js");

const config =
  require("../config/config");

const securityLog =
  require("../utils/securityLog");

const userWhitelist =
  require("../whitelist/userWhitelist");

const roleWhitelist =
  require("../whitelist/roleWhitelist");

function isWhitelisted(member, executor) {
  if (
    executor &&
    userWhitelist.has(
      executor.id,
      "Bot Add"
    )
  ) {
    return true;
  }

  const roleIds =
    executor?.roles?.cache
      ? [...executor.roles.cache.keys()]
      : [];

  return roleWhitelist.has(
    roleIds,
    "Bot Add"
  );
}

async function findBotAdder(
  guild,
  botUserId
) {
  try {
    const logs =
      await guild.fetchAuditLogs({
        type: AuditLogEvent.BotAdd,
        limit: 10
      });

    const entry =
      logs.entries.find(
        entry =>
          entry.target?.id === botUserId &&
          Date.now() -
            entry.createdTimestamp <
            15000
      );

    return entry || null;
  } catch (error) {
    console.error(
      "❌ Failed to fetch Bot Add audit log:",
      error
    );

    return null;
  }
}

async function handleBotAdd(member) {
  if (
    !member.guild ||
    !member.user.bot
  ) {
    return;
  }

  // Don't process the security bot itself
  if (
    member.id ===
    member.guild.client.user.id
  ) {
    return;
  }

  const guild =
    member.guild;

  /*
   * =========================
   * FIND WHO ADDED THE BOT
   * =========================
   */

  const auditEntry =
    await findBotAdder(
      guild,
      member.user.id
    );

  const executor =
    auditEntry?.executor || null;

  let responsibleMember = null;

  if (executor) {
    try {
      responsibleMember =
        await guild.members.fetch(
          executor.id
        );
    } catch {}
  }

  /*
   * =========================
   * BOT ROLE
   * =========================
   */

  const role =
    guild.roles.cache.get(
      config.botRoleId
    );

  if (role) {
    try {
      if (
        role.editable &&
        !member.roles.cache.has(
          role.id
        )
      ) {
        await member.roles.add(
          role,
          "Security Bot — automatic bot role"
        );
      }
    } catch (error) {
      console.error(
        "❌ Failed to assign bot role:",
        error
      );
    }
  }

  /*
   * =========================
   * WHITELIST CHECK
   * =========================
   */

  const whitelisted =
    isWhitelisted(
      responsibleMember,
      executor
    );

  /*
   * =========================
   * SECURITY LOG
   * =========================
   */

  await securityLog(guild, {
    title: whitelisted
      ? "Whitelisted Bot Added"
      : "Bot Added",
    color: whitelisted
      ? 0x57F287
      : 0x5865F2,
    fields: [
      {
        name: "Bot",
        value:
          `${member.user} (${member.user.id})`
      },
      {
        name: "Added By",
        value: executor
          ? `${executor}`
          : "Unknown"
      },
      {
        name: "Protection",
        value:
          "Bot was not automatically punished"
      },
      {
        name: "Bot Role",
        value: role
          ? `<@&${role.id}>`
          : "Role not found"
      }
    ]
  });
}

module.exports = {
  handleBotAdd
};
