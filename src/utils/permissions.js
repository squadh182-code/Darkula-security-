const { PermissionFlagsBits } = require("discord.js");

function hasPermission(member, permission) {
  if (!member) return false;

  return member.permissions.has(permission);
}

function canManageRoles(member) {
  return hasPermission(
    member,
    PermissionFlagsBits.ManageRoles
  );
}

function canManageChannels(member) {
  return hasPermission(
    member,
    PermissionFlagsBits.ManageChannels
  );
}

function canModerateMembers(member) {
  return hasPermission(
    member,
    PermissionFlagsBits.ModerateMembers
  );
}

module.exports = {
  hasPermission,
  canManageRoles,
  canManageChannels,
  canModerateMembers
};
