const securityLog =
  require("../utils/securityLog");

const userWhitelist =
  require("../whitelist/userWhitelist");

const roleWhitelist =
  require("../whitelist/roleWhitelist");

const joinTracker =
  new Map();

const JOIN_WINDOW =
  10000;

const RAID_LIMIT =
  8;

const LOG_COOLDOWN =
  60000;

const lastRaidLog =
  new Map();

async function isWhitelisted(
  member
) {
  if (
    await userWhitelist.has(
      member.id,
      "All"
    )
  ) {
    return true;
  }

  const roleIds =
    member.roles?.cache
      ? [
          ...member.roles.cache.keys()
        ]
      : [];

  return roleWhitelist.has(
    roleIds,
    "All"
  );
}

async function handleMemberJoin(
  member
) {
  if (
    !member.guild ||
    member.user.bot
  ) {
    return false;
  }

  if (
    await isWhitelisted(member)
  ) {
    return false;
  }

  const guildId =
    member.guild.id;

  const now =
    Date.now();

  const recent =
    (
      joinTracker.get(
        guildId
      ) || []
    ).filter(
      timestamp =>
        now - timestamp <
        JOIN_WINDOW
    );

  recent.push(now);

  joinTracker.set(
    guildId,
    recent
  );

  if (
    recent.length <
    RAID_LIMIT
  ) {
    return false;
  }

  const lastLog =
    lastRaidLog.get(
      guildId
    ) || 0;

  if (
    now - lastLog <
    LOG_COOLDOWN
  ) {
    return true;
  }

  lastRaidLog.set(
    guildId,
    now
  );

  await securityLog(
    member.guild,
    {
      title:
        "Possible Raid Detected",
      color: 0xFF0000,
      fields: [
        {
          name: "Recent Joins",
          value:
            `${recent.length} joins within 10 seconds`
        },
        {
          name: "Latest User",
          value:
            `${member.user} (${member.id})`
        },
        {
          name: "Protection",
          value:
            "Raid activity detected and logged"
        }
      ]
    }
  );

  return true;
}

module.exports = {
  handleMemberJoin
};
