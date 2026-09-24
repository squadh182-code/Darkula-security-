const securityLog = require("../utils/securityLog");

async function clearUserRoles(member, reason) {
  if (!member) return false;

  if (!member.manageable) {
    console.log(
      `❌ Cannot manage roles for ${member.user?.tag || member.id}`
    );

    return false;
  }

  const removableRoles = member.roles.cache.filter(
    (role) =>
      role.id !== member.guild.id &&
      !role.managed &&
      role.editable
  );

  if (removableRoles.size === 0) {
    return false;
  }

  try {
    await member.roles.remove(
      removableRoles,
      reason
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Failed to clear roles:",
      error
    );

    return false;
  }
}

async function handleRoleAction({
  guild,
  action,
  role,
  executor,
  responsibleMember
}) {
  if (!guild) return;

  console.log(
    `🛡️ Role Protection: ${action}`
  );

  const dangerousActions = [
    "Role Delete",
    "Role Create"
  ];

  if (
    dangerousActions.includes(action) &&
    responsibleMember
  ) {
    const cleared = await clearUserRoles(
      responsibleMember,
      `Security Protection — ${action}`
    );

    if (cleared) {
      await securityLog(guild, {
        title: "Roles Cleared",
        color: 0xFF0000,
        fields: [
          {
            name: "User",
            value:
              `${responsibleMember.user} ` +
              `(${responsibleMember.id})`
          },
          {
            name: "Reason",
            value: action
          }
        ]
      });
    }
  }

  await securityLog(guild, {
    title: `Role ${action}`,
    color: 0xFF0000,
    fields: [
      {
        name: "Role",
        value: role
          ? `${role.name} (${role.id})`
          : "Unknown"
      },
      {
        name: "Action By",
        value: executor
          ? `${executor}`
          : "Unknown"
      }
    ]
  });
}

module.exports = {
  handleRoleAction,
  clearUserRoles
};
