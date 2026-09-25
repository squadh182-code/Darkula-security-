const securityLog =
  require("../utils/securityLog");

const userWhitelist =
  require("../whitelist/userWhitelist");

const roleWhitelist =
  require("../whitelist/roleWhitelist");

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
    member.id ===
    botMember.id
  ) {
    return false;
  }

  if (
    !member.manageable
  ) {
    return false;
  }

  const removableRoles =
    member.roles.cache.filter(
      role =>
        role.id !==
          member.guild.id &&
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
      "❌ Anti-Nuke role clear failed:",
      error
    );

    return false;
  }
}

async function isWhitelisted(
  executor,
  type,
  member
) {
  if (!executor) {
    return false;
  }

  if (
    type &&
    await userWhitelist.has(
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

async function handleAction({
  guild,
  action,
  executor,
  responsibleMember,
  whitelistType,
  reason
}) {
  if (
    !guild ||
    !executor
  ) {
    return false;
  }

  if (
    executor.id ===
    guild.client.user.id
  ) {
    return false;
  }

  if (
    whitelistType &&
    await isWhitelisted(
      executor,
      whitelistType,
      responsibleMember
    )
  ) {
    await securityLog(
      guild,
      {
        title:
          "Whitelisted Security Action",
        color: 0x57F287,
        fields: [
          {
            name: "Action",
            value:
              action || "Unknown"
          },
          {
            name: "User",
            value:
              `${executor}`
          },
          {
            name: "Reason",
            value:
              reason ||
              "Whitelisted action"
          }
        ]
      }
    );

    return true;
  }

  let rolesCleared =
    false;

  if (
    action ===
      "Channel Permission Change" &&
    responsibleMember
  ) {
    rolesCleared =
      await clearUserRoles(
        responsibleMember,
        "Anti-Nuke — unauthorized channel permission change"
      );
  }

  await securityLog(
    guild,
    {
      title:
        rolesCleared
          ? "Roles Cleared"
          : "Anti-Nuke Detection",

      color: 0xFF0000,

      fields: [
        {
          name: "Action",
          value:
            action || "Unknown"
        },
        {
          name: "User",
          value:
            `${executor}`
        },
        {
          name: "Reason",
          value:
            reason ||
            "Unauthorized security action"
        },
        {
          name: "Protection",
          value:
            rolesCleared
              ? "Roles Cleared"
              : "Logged"
        }
      ]
    }
  );

  return false;
}

module.exports = {
  handleAction,
  isWhitelisted,
  clearUserRoles
};
