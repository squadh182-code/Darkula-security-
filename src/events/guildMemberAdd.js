const antiRaid =
  require("../security/antiRaid");

const antiBot =
  require("../security/antiBot");

module.exports = async (member) => {
  if (!member.guild) return;

  try {
    const raidDetected =
      antiRaid.handleMemberJoin(member);

    if (raidDetected) {
      console.log(
        `🚨 Possible raid detected in ${member.guild.name}`
      );
    }

    if (member.user.bot) {
      await antiBot.handleBotAdd(member);
    }
  } catch (error) {
    console.error(
      "❌ Member protection error:",
      error
    );
  }
};
