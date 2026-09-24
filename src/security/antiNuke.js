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
  if (!executor) {
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
      ? [...member.roles.cache.keys()]
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
  if (!guild || !executor) {
    return false;
  }

  // Never process the security bot
  if (
    executor.id ===
    guild.client.user.id
  ) {
    return false;
  }

  /*
   * =========================
   * WHITELIST
   * =========================
   */

  if (
    whitelistType &&
    isWhitelisted(
      executor,
      whitelistType,
      responsibleMember
    )
  ) {
    await securityLog(guild, {
      title: "Whitelisted Security Action",
      color: 0x57F287,
      fields: [
        {
          name: "Action",
          value: action || "Unknown"
        },
        {
          name: "User",
          value: `${executor}`
        },
        {
          name: "Reason",
          value:
            reason ||
            "Whitelisted action"
        }
      ]
    });

    return true;
  }

  /*
   * =========================
   * SECURITY LOG
   * =========================
   */

  await securityLog(guild, {
    title: "Anti-Nuke Detection",
    color: 0xFF0000,
    fields: [
      {
        name: "Action",
        value: action || "Unknown"
      },
      {
        name: "User",
        value: `${executor}`
      },
      {
        name: "Reason",
        value:
          reason ||
          "Unauthorized security action"
      }
    ]
  });

  return false;
}

module.exports = {
  handleAction,
  isWhitelisted
};
