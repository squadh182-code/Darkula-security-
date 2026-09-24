const {
  PermissionFlagsBits
} = require("discord.js");

async function timeoutMember(
  member,
  duration,
  reason
) {
  if (!member) {
    return false;
  }

  const guild =
    member.guild;

  if (!guild) {
    return false;
  }

  const botMember =
    guild.members.me;

  if (!botMember) {
    console.log(
      "❌ Security bot member not found."
    );

    return false;
  }

  // Check Moderate Members permission
  if (
    !botMember.permissions.has(
      PermissionFlagsBits.ModerateMembers
    )
  ) {
    console.log(
      "❌ Security bot is missing Moderate Members permission."
    );

    return false;
  }

  // Never timeout the bot itself
  if (
    member.id === botMember.id
  ) {
    return false;
  }

  // Discord role hierarchy check
  if (
    botMember.roles.highest.comparePositionTo(
      member.roles.highest
    ) <= 0
  ) {
    console.log(
      `❌ Cannot timeout ${member.user?.tag || member.id} — role is too high.`
    );

    return false;
  }

  if (!member.moderatable) {
    console.log(
      `❌ Cannot timeout ${member.user?.tag || member.id}`
    );

    return false;
  }

  try {
    await member.timeout(
      duration,
      reason
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Timeout failed:",
      error
    );

    return false;
  }
}

module.exports = {
  timeoutMember
};
