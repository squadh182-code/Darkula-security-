const antiBadWords =
  require("../security/antiBadWords");

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
    /* BAD WORDS */

    const badWordPunished =
      await antiBadWords.handleMessage(
        message
      );

    if (badWordPunished) {
      return;
    }

    /* SPAM */

    const spamPunished =
      await antiSpam.handleMessage(
        message
      );

    if (spamPunished) {
      return;
    }

    /* INVITES / LINKS */

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
