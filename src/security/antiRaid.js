const securityLog =
  require("../utils/securityLog");

const userWhitelist =
  require("../whitelist/userWhitelist");

const roleWhitelist =
  require("../whitelist/roleWhitelist");

const joins = new Map();
const raidCooldown = new Map();

const JOIN_WINDOW = 10000;
const RAID_LIMIT = 8;
const RAID_LOG_COOLDOWN = 60000;

function isWhitelisted(member) {
  if (
    userWhitelist.has(
      member.id,
      "All"
    )
  ) {
    return true;
  }

  const roleIds =
    member.roles?.cache
      ? [...member.roles.cache.keys()]
      : [];

  return roleWhitelist.has(
    roleIds,
    "All"
  );
}

async function handleMemberJoin(member) {
  if (!member.guild) {
    return false;
  }

  // Ignore bots
  if (member.user.bot) {
    return false;
  }

  // Ignore whitelisted members
  if (isWhitelisted(member)) {
    return false;
  }

  const guildId =
    member.guild.id;

  const now = Date.now();

  if (!joins.has(guildId)) {
    joins.set(guildId, []);
  }

  const recent =
    joins
      .get(guildId)
      .filter(
        time =>
          now - time < JOIN_WINDOW
      );

  recent.push(now);

  joins.set(
    guildId,
    recent
  );

  if (
    recent.length < RAID_LIMIT
  ) {
    return false;
  }

  /*
   * Prevent repeated raid log spam
   */

  const lastRaid =
    raidCooldown.get(guildId);

  if (
    lastRaid &&
    now - lastRaid <
      RAID_LOG_COOLDOWN
  ) {
    return true;
  }

  raidCooldown.set(
    guildId,
    now
  );

  await securityLog(
    member.guild,
    {
      title: "Possible Raid Detected",
      color: 0xFF0000,
      fields: [
        {
          name: "Join Count",
          value:
            `${recent.length} members`
        },
        {
          name: "Time Window",
          value:
            "10 seconds"
        },
        {
          name: "Threshold",
          value:
            `${RAID_LIMIT} members`
        },
        {
          name: "Status",
          value:
            "Abnormal join activity detected"
        }
      ]
    }
  );

  return true;
}

function cleanupGuild(guildId) {
  joins.delete(guildId);
  raidCooldown.delete(guildId);
}

module.exports = {
  handleMemberJoin,
  cleanupGuild
};
