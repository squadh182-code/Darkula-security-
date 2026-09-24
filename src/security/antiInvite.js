const config =
  require("../config/config");

const {
  timeoutMember
} = require("../utils/timeout");

const securityLog =
  require("../utils/securityLog");

const channelWhitelist =
  require("../whitelist/channelWhitelist");

const userWhitelist =
  require("../whitelist/userWhitelist");

const roleWhitelist =
  require("../whitelist/roleWhitelist");

const inviteRegex =
  /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[a-zA-Z0-9-]+/i;

const linkRegex =
  /https?:\/\/[^\s]+/i;

function isWhitelisted(message) {
  if (
    channelWhitelist.has(
      message.channel.id,
      "Invite"
    )
  ) {
    return true;
  }

  if (
    userWhitelist.has(
      message.author.id,
      "Invite"
    )
  ) {
    return true;
  }

  const roleIds =
    message.member?.roles?.cache
      ? [
          ...message.member.roles.cache.keys()
        ]
      : [];

  return roleWhitelist.has(
    roleIds,
    "Invite"
  );
}

async function handleMessage(
  message
) {
  if (
    !message.guild ||
    message.author.bot
  ) {
    return;
  }

  if (
    isWhitelisted(message)
  ) {
    return;
  }

  const hasInvite =
    inviteRegex.test(
      message.content
    );

  const hasLink =
    linkRegex.test(
      message.content
    );

  if (
    !hasInvite &&
    !hasLink
  ) {
    return;
  }

  try {
    await message.delete();
  } catch {}

  const reason =
    hasInvite
      ? "Unwanted Discord invite"
      : "Unwanted link";

  const success =
    await timeoutMember(
      message.member,
      config.timeoutDuration,
      reason
    );

  if (success) {
    await message.channel
      .send({
        content:
          `⚠️ ${message.author} has been timed out for 5 minutes.\n` +
          `Reason: ${reason}.`
      })
      .catch(() => {});
  }

  await securityLog(
    message.guild,
    {
      title: "User Timed Out",
      color: 0xFF0000,
      fields: [
        {
          name: "User",
          value:
            `${message.author} (${message.author.id})`
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
    }
  );
}

module.exports = {
  handleMessage
};
