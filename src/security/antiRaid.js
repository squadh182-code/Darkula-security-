const joins = new Map();

const JOIN_WINDOW = 10000;
const RAID_LIMIT = 8;

function handleMemberJoin(member) {
  if (!member.guild) return;

  const guildId = member.guild.id;
  const now = Date.now();

  if (!joins.has(guildId)) {
    joins.set(guildId, []);
  }

  const recent = joins
    .get(guildId)
    .filter((time) => now - time < JOIN_WINDOW);

  recent.push(now);

  joins.set(guildId, recent);

  if (recent.length >= RAID_LIMIT) {
    console.log(
      `🚨 Possible raid detected in ${member.guild.name}`
    );

    return true;
  }

  return false;
}

module.exports = {
  handleMemberJoin
};
