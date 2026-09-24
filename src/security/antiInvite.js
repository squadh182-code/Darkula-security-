const { timeoutMember } = require("../utils/timeout");
const securityLog = require("../utils/securityLog");

const inviteRegex =
  /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[a-zA-Z0-9-]+/i;

const linkRegex =
  /https?:\/\/[^\s]+/i;

async function handleMessage(message) {
  if (!message.guild || message.author.bot) return;

  const hasInvite = inviteRegex.test(message.content);
  const hasLink = linkRegex.test(message.content);

  if (!hasInvite && !hasLink) return;

  // Channel whitelist will be checked here
  // when the whitelist system is connected.
  // For now, protection is active.

  try {
    await message.delete();
  } catch {}

  const reason = hasInvite
    ? "Unwanted Discord invite"
    : "Unwanted link";

  const success = await timeoutMember(
    message.member,
    5 * 60 * 1000,
    reason
  );

  if (success) {
    await message.channel.send({
      content:
        `⚠️ ${message.author} has been timed out for 5 minutes.\n` +
        `Reason: ${reason}.`
    }).catch(() => {});
  }

  await securityLog(message.guild, {
    title: "User Timed Out",
    color: 0xFF0000,
    fields: [
      {
        name: "User",
        value: `${message.author} (${message.author.id})`
      },
      {
        name: "Duration",
        value: "5 minutes",
        inline: true
      },
      {
        name: "Reason",
        value: reason,
        inline: true
      }
    ]
  });
}

module.exports = {
  handleMessage
};
