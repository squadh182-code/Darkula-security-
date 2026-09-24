const {
  AuditLogEvent
} = require("discord.js");

const roleProtection =
  require("../security/roleProtection");

const channelProtection =
  require("../security/channelProtection");

const antiNuke =
  require("../security/antiNuke");

const securityLog =
  require("../utils/securityLog");

async function getMember(guild, userId) {
  if (!userId) return null;

  try {
    return await guild.members.fetch(userId);
  } catch {
    return null;
  }
}

function getTargetId(auditLogEntry) {
  return (
    auditLogEntry.target?.id ||
    auditLogEntry.targetId ||
    null
  );
}

module.exports = async (
  auditLogEntry,
  guild
) => {
  if (!guild) return;

  const executor =
    auditLogEntry.executor;

  if (!executor) return;

  // Never process actions made by our own security bot
  if (
    executor.id === guild.client.user.id
  ) {
    return;
  }

  const responsibleMember =
    await getMember(
      guild,
      executor.id
    );

  /*
   * =========================
   * ROLE DELETE
   * =========================
   */

  if (
    auditLogEntry.action ===
    AuditLogEvent.RoleDelete
  ) {
    await antiNuke.handleAction({
      guild,
      action: "Role Delete",
      executor,
      responsibleMember,
      whitelistType: "Role Delete",
      reason: "Role deletion detected"
    });

    await roleProtection.handleRoleAction({
      guild,
      action: "Role Delete",
      role: auditLogEntry.target,
      executor,
      responsibleMember
    });

    return;
  }

  /*
   * =========================
   * ROLE CREATE
   * =========================
   */

  if (
    auditLogEntry.action ===
    AuditLogEvent.RoleCreate
  ) {
    await antiNuke.handleAction({
      guild,
      action: "Role Create",
      executor,
      responsibleMember,
      whitelistType: "Role Create",
      reason: "Role creation detected"
    });

    await roleProtection.handleRoleAction({
      guild,
      action: "Role Create",
      role: auditLogEntry.target,
      executor,
      responsibleMember
    });

    return;
  }

  /*
   * =========================
   * ROLE UPDATE
   * =========================
   */

  if (
    auditLogEntry.action ===
    AuditLogEvent.RoleUpdate
  ) {
    await antiNuke.handleAction({
      guild,
      action: "Role Update",
      executor,
      responsibleMember,
      whitelistType: "Role Update",
      reason: "Role update detected"
    });

    await roleProtection.handleRoleAction({
      guild,
      action: "Role Update",
      role: auditLogEntry.target,
      executor,
      responsibleMember
    });

    return;
  }

  /*
   * =========================
   * CHANNEL DELETE
   * =========================
   */

  if (
    auditLogEntry.action ===
    AuditLogEvent.ChannelDelete
  ) {
    await antiNuke.handleAction({
      guild,
      action: "Channel Delete",
      executor,
      responsibleMember,
      whitelistType: "Channel Delete",
      reason: "Channel deletion detected"
    });

    await channelProtection.handleChannelAction({
      guild,
      action: "Delete",
      channel: auditLogEntry.target,
      executor,
      responsibleMember
    });

    return;
  }

  /*
   * =========================
   * CHANNEL CREATE
   * =========================
   */

  if (
    auditLogEntry.action ===
    AuditLogEvent.ChannelCreate
  ) {
    await antiNuke.handleAction({
      guild,
      action: "Channel Create",
      executor,
      responsibleMember,
      whitelistType: "Channel Create",
      reason: "Channel creation detected"
    });

    await channelProtection.handleChannelAction({
      guild,
      action: "Create",
      channel: auditLogEntry.target,
      executor,
      responsibleMember
    });

    return;
  }

  /*
   * =========================
   * PERMISSION / OVERWRITE
   * =========================
   */

  if (
    auditLogEntry.action ===
      AuditLogEvent.ChannelOverwriteCreate ||
    auditLogEntry.action ===
      AuditLogEvent.ChannelOverwriteUpdate ||
    auditLogEntry.action ===
      AuditLogEvent.ChannelOverwriteDelete
  ) {
    await antiNuke.handleAction({
      guild,
      action: "Channel Permission Change",
      executor,
      responsibleMember,
      reason:
        "Channel permission/overwrite change detected"
    });

    return;
  }

  /*
   * =========================
   * MEMBER BAN
   * =========================
   */

  if (
    auditLogEntry.action ===
    AuditLogEvent.MemberBanAdd
  ) {
    const targetId =
      getTargetId(auditLogEntry);

    await securityLog(guild, {
      title: "Member Banned",
      color: 0xFF0000,
      fields: [
        {
          name: "User",
          value: targetId
            ? `<@${targetId}> (${targetId})`
            : "Unknown"
        },
        {
          name: "Action By",
          value: `${executor}`
        },
        {
          name: "Type",
          value: "External Discord Action"
        }
      ]
    });

    return;
  }

  /*
   * =========================
   * MEMBER KICK
   * =========================
   */

  if (
    auditLogEntry.action ===
    AuditLogEvent.MemberKick
  ) {
    const targetId =
      getTargetId(auditLogEntry);

    await securityLog(guild, {
      title: "Member Kicked",
      color: 0xFFA500,
      fields: [
        {
          name: "User",
          value: targetId
            ? `<@${targetId}> (${targetId})`
            : "Unknown"
        },
        {
          name: "Action By",
          value: `${executor}`
        },
        {
          name: "Type",
          value: "External Discord Action"
        }
      ]
    });

    return;
  }

  /*
   * =========================
   * MEMBER TIMEOUT
   * =========================
   */

  if (
    auditLogEntry.action ===
    AuditLogEvent.MemberUpdate
  ) {
    const changes =
      auditLogEntry.changes || [];

    const timeoutChange =
      changes.find(
        change =>
          change.key ===
          "communication_disabled_until"
      );

    if (!timeoutChange) {
      return;
    }

    const targetId =
      getTargetId(auditLogEntry);

    const active =
      timeoutChange.new !== null &&
      timeoutChange.new !== undefined;

    await securityLog(guild, {
      title: active
        ? "User Timed Out"
        : "User Timeout Removed",
      color: active
        ? 0xFFA500
        : 0x57F287,
      fields: [
        {
          name: "User",
          value: targetId
            ? `<@${targetId}> (${targetId})`
            : "Unknown"
        },
        {
          name: "Action By",
          value: `${executor}`
        },
        {
          name: "Type",
          value: "External Discord Action"
        }
      ]
    });

    return;
  }

  /*
   * =========================
   * BOT ADD
   * =========================
   */

  if (
    auditLogEntry.action ===
    AuditLogEvent.BotAdd
  ) {
    const targetId =
      getTargetId(auditLogEntry);

    await securityLog(guild, {
      title: "Bot Added",
      color: 0x5865F2,
      fields: [
        {
          name: "Bot",
          value: targetId
            ? `<@${targetId}> (${targetId})`
            : "Unknown"
        },
        {
          name: "Added By",
          value: `${executor}`
        }
      ]
    });

    return;
  }
};
