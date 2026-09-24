const securityLog =
  require("../utils/securityLog");

const userWhitelist =
  require("../whitelist/userWhitelist");

const roleWhitelist =
  require("../whitelist/roleWhitelist");

function isWhitelisted(
  executor,
  type,
  member
) {
  if (
    !executor
  ) {
    return false;
  }

  if (
    userWhitelist.has(
      executor.id,
      type
    )
  ) {
    return true;
  }

  const roleIds =
    member?.roles?.cache
      ? [
          ...member.roles.cache.keys()
        ]
      : [];

  return roleWhitelist.has(
    roleIds,
    type
  );
}

async function clearUserRoles(
  member,
  reason
) {
  if (!member) {
    return false;
  }

  const botMember =
    member.guild.members.me;

  if (!botMember) {
    return false;
  }

  if (
    member.id === botMember.id
  ) {
    return false;
  }

  if (!member.manageable) {
    console.log(
      `❌ Cannot manage roles for ${
        member.user?.tag || member.id
      }`
    );

    return false;
  }

  const removableRoles =
    member.roles.cache.filter(
      role =>
        role.id !== member.guild.id &&
        !role.managed &&
        role.editable &&
        botMember.roles.highest.comparePositionTo(
          role
        ) > 0
    );

  if (
    !removableRoles.size
  ) {
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
  if (
    !guild ||
    !executor
  ) {
    return;
  }

  if (
    executor.id ===
    guild.client.user.id
  ) {
    return;
  }

  if (
    isWhitelisted(
      executor,
      action,
      responsibleMember
    )
  ) {
    await securityLog(guild, {
      title:
        "Whitelisted Security Action",
      color: 0x57F287,
      fields: [
        {
          name: "Action",
          value: action
        },
        {
          name: "User",
          value: `${executor}`
        },
        {
          name: "Role",
          value: role
            ? `${role.name} (${role.id})`
            : "Unknown"
        }
      ]
    });

    return;
  }

  const dangerousActions = [
    "Role Delete",
    "Role Create"
  ];

  let rolesCleared = false;

  if (
    dangerousActions.includes(action) &&
    responsibleMember
  ) {
    rolesCleared =
      await clearUserRoles(
        responsibleMember,
        `Security Protection — ${action}`
      );
  }

  if (rolesCleared) {
    await securityLog(guild, {
      title: "Roles Cleared",
      color: 0xFF0000,
      fields: [
        {
          name: "User",
          value:
            `${responsibleMember.user} (${responsibleMember.id})`
        },
        {
          name: "Reason",
          value:
            `Unauthorized ${action}`
        }
      ]
    });
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
        value: `${executor}`
      },
      {
        name: "Protection",
        value: rolesCleared
          ? "Roles Cleared"
          : "Logged"
      }
    ]
  });
}

module.exports = {
  handleRoleAction,
  clearUserRoles
};
