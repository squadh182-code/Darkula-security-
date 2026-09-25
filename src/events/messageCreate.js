const antiSpam =
  require("../security/antiSpam");

const antiInvite =
  require("../security/antiInvite");

module.exports = async (
  message
) => {
  if (!message.guild) {
    return;
  }

  if (message.author.bot) {
    return;
  }

  try {
    const spamPunished =
      await antiSpam.handleMessage(
        message
      );

    if (spamPunished) {
      return;
    }

    await antiInvite.handleMessage(
      message
    );

  } catch (error) {
    console.error(
      "❌ Message protection error:",
      error
    );
  }
};
