const {
  PermissionFlagsBits
} = require("discord.js");

function hasPermission(
  member,
  permission
) {
  if (!member) {
    return false;
  }

  return member.permissions.has(
    permission
  );
}

function canManageRoles(
  member
) {
  return hasPermission(
    member,
    PermissionFlagsBits.ManageRoles
  );
}

function canManageChannels(
  member
) {
  return hasPermission(
    member,
    PermissionFlagsBits.ManageChannels
  );
}

function canModerateMembers(
  member
) {
  return hasPermission(
    member,
    PermissionFlagsBits.ModerateMembers
  );
}

function canViewAuditLog(
  member
) {
  return hasPermission(
    member,
    PermissionFlagsBits.ViewAuditLog
  );
}

function canManageMember(
  botMember,
  targetMember
) {
  if (
    !botMember ||
    !targetMember
  ) {
    return false;
  }

  if (
    !canManageRoles(botMember)
  ) {
    return false;
  }

  return botMember.roles.highest.comparePositionTo(
    targetMember.roles.highest
  ) > 0;
}

function canManageRole(
  botMember,
  targetRole
) {
  if (
    !botMember ||
    !targetRole
  ) {
    return false;
  }

  if (
    !canManageRoles(botMember)
  ) {
    return false;
  }

  return botMember.roles.highest.comparePositionTo(
    targetRole
  ) > 0;
}

module.exports = {
  hasPermission,
  canManageRoles,
  canManageChannels,
  canModerateMembers,
  canViewAuditLog,
  canManageMember,
  canManageRole
};
