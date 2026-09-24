const {
  AuditLogEvent
} = require("discord.js");

const roleProtection =
  require("../security/roleProtection");

const channelProtection =
  require("../security/channelProtection");

async function getMember(guild, userId) {
  if (!userId) return null;

  try {
    return await guild.members.fetch(
      userId
    );
  } catch {
    return null;
  }
}

module.exports = async (
  auditLogEntry,
  guild
) => {
  if (!guild) return;

  const executor =
    auditLogEntry.executor;

  if (!executor) return;

  // =========================
  // ROLE DELETE
  // =========================

  if (
    auditLogEntry.action ===
    AuditLogEvent.RoleDelete
  ) {
    const role =
      auditLogEntry.target;

    const member =
      await getMember(
        guild,
        executor.id
      );

    await roleProtection.handleRoleAction({
      guild,
      action: "Role Delete",
      role,
      executor,
      responsibleMember: member
    });

    return;
  }

  // =========================
  // ROLE CREATE
  // =========================

  if (
    auditLogEntry.action ===
    AuditLogEvent.RoleCreate
  ) {
    const role =
      auditLogEntry.target;

    const member =
      await getMember(
        guild,
        executor.id
      );

    await roleProtection.handleRoleAction({
      guild,
      action: "Role Create",
      role,
      executor,
      responsibleMember: member
    });

    return;
  }

  // =========================
  // ROLE UPDATE
  // =========================

  if (
    auditLogEntry.action ===
    AuditLogEvent.RoleUpdate
  ) {
    const role =
      auditLogEntry.target;

    await roleProtection.handleRoleAction({
      guild,
      action: "Role Update",
      role,
      executor
    });

    return;
  }

  // =========================
  // CHANNEL DELETE
  // =========================

  if (
    auditLogEntry.action ===
    AuditLogEvent.ChannelDelete
  ) {
    await channelProtection.handleChannelAction({
      guild,
      action: "Delete",
      channel: auditLogEntry.target,
      executor
    });

    return;
  }

  // =========================
  // CHANNEL CREATE
  // =========================

  if (
    auditLogEntry.action ===
    AuditLogEvent.ChannelCreate
  ) {
    await channelProtection.handleChannelAction({
      guild,
      action: "Create",
      channel: auditLogEntry.target,
      executor
    });

    return;
  }
};
