const securityLog =
  require("../utils/securityLog");

const userWhitelist =
  require("../whitelist/userWhitelist");

const roleWhitelist =
  require("../whitelist/roleWhitelist");

async function isWhitelisted(
  executor,
  type,
  member
) {
  if (
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

  if (
    roleIds.length &&
    await roleWhitelist.has(
      roleIds,
      type
    )
  ) {
    return true;
  }

  return false;
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
      "❌ Failed to clear roles:",
      error
    );

    return false;
  }
}

async function handleChannelAction({
  guild,
  action,
  channel,
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

  let whitelistType;

  if (action === "Delete") {
    whitelistType =
      "Channel Delete";
  } else if (action === "Create") {
    whitelistType =
      "Channel Create";
  } else if (action === "Update") {
    whitelistType =
      "Channel Update";
  } else {
    whitelistType =
      `Channel ${action}`;
  }

  if (
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
          "Whitelisted Channel Action",
        color: 0x57F287,
        fields: [
          {
            name: "Action",
            value: action
          },
          {
            name: "User",
            value:
              `${executor}`
          },
          {
            name: "Channel",
            value:
              channel
                ? `${channel.name || channel.id}`
                : "Unknown"
          }
        ]
      }
    );

    return;
  }

  let rolesCleared =
    false;

  if (
    responsibleMember
  ) {
    rolesCleared =
      await clearUserRoles(
        responsibleMember,
        `Security Protection — Channel ${action}`
      );
  }

  if (rolesCleared) {
    await securityLog(
      guild,
      {
        title:
          "Roles Cleared",
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
              `Unauthorized Channel ${action}`
          }
        ]
      }
    );
  }

  await securityLog(
    guild,
    {
      title:
        `Channel ${action}`,
      color: 0xFF0000,
      fields: [
        {
          name: "Channel",
          value:
            channel
              ? `${channel.name || channel.id}`
              : "Unknown"
        },
        {
          name: "Action By",
          value:
            `${executor}`
        },
        {
          name: "Protection",
          value:
            rolesCleared
              ? "Roles Cleared"
              : "Could not clear roles"
        }
      ]
    }
  );
}

module.exports = {
  handleChannelAction,
  clearUserRoles
};
