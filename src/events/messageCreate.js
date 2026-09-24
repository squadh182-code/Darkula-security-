const antiSpam =
  require("../security/antiSpam");

const antiInvite =
  require("../security/antiInvite");

module.exports = async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  try {
    await antiSpam.handleMessage(message);
    await antiInvite.handleMessage(message);
  } catch (error) {
    console.error(
      "❌ Message protection error:",
      error
    );
  }
};
