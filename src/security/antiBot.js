const config = require("../config/config");
const securityLog = require("../utils/securityLog");

async function handleBotAdd(member) {
  if (!member.guild || !member.user.bot) return;

  const role = member.guild.roles.cache.get(
    config.botRoleId
  );

  if (role) {
    try {
      if (role.editable) {
        await member.roles.add(
          role,
          "Security Bot — automatic bot role"
        );
      }
    } catch (error) {
      console.error(
        "❌ Failed to assign bot role:",
        error
      );
    }
  }

  await securityLog(member.guild, {
    title: "Bot Added",
    color: 0x5865F2,
    fields: [
      {
        name: "Bot",
        value: `${member.user} (${member.user.id})`
      },
      {
        name: "Added By",
        value: "Checking Audit Log..."
      }
    ]
  });
}

module.exports = {
  handleBotAdd
};
