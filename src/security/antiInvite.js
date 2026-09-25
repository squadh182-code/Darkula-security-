const config =
  require("../config/config");

const userWhitelist =
  require("../whitelist/userWhitelist");

const roleWhitelist =
  require("../whitelist/roleWhitelist");

const channelWhitelist =
  require("../whitelist/channelWhitelist");

const {
  timeoutMember
} = require("../utils/timeout");

const {
  sendTimeoutNotification
} = require("../utils/timeoutNotification");

const securityLog =
  require("../utils/securityLog");

/* =========================
   DETECTION
========================= */

const discordInviteRegex =
  /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[^\s]+/i;

const urlRegex =
  /https?:\/\/[^\s]+|www\.[^\s]+/i;

/* =========================
   WHITELIST
========================= */

async function isWhitelisted(
  message
) {
  if (
    await userWhitelist.has(
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

  if (
    roleIds.length &&
    await roleWhitelist.has(
      roleIds,
      "Invite"
    )
  ) {
    return true;
  }

  if (
    await channelWhitelist.has(
      message.channel.id,
      "Invite"
    )
  ) {
    return true;
  }

  return false;
}

/* =========================
   PUNISH
========================= */

async function punish(
  message
) {
  if (!message.member) {
    return false;
  }

  if (
    message.author.id ===
    message.client.user.id
  ) {
    return false;
  }

  await message.delete()
    .catch(() => {});

  const reason =
    "Unauthorized invite/link.";

  const timedOut =
    await timeoutMember(
      message.member,
      config.timeoutDuration,
      reason
    );

  if (!timedOut) {
    return false;
  }

  await sendTimeoutNotification(
    message,
    reason,
    "5 minutes"
  );

  await securityLog(
    message.guild,
    {
      title: "User Timed Out",
      description:
        `${message.author} was automatically timed out.`,
      color: 0xED4245,

      fields: [
        {
          name: "User",
          value:
            `${message.author}\n\`${message.author.id}\``,
          inline: true
        },
        {
          name: "Duration",
          value: "5 minutes",
          inline: true
        },
        {
          name: "Reason",
          value: reason
        },
        {
          name: "Channel",
          value: `${message.channel}`,
          inline: true
        }
      ]
    }
  );

  return true;
}

/* =========================
   MAIN
========================= */

async function handleMessage(
  message
) {
  if (!message.guild) {
    return false;
  }

  if (message.author.bot) {
    return false;
  }

  if (!message.content) {
    return false;
  }

  const hasInvite =
    discordInviteRegex.test(
      message.content
    );

  const hasLink =
    urlRegex.test(
      message.content
    );

  if (!hasInvite && !hasLink) {
    return false;
  }

  if (
    await isWhitelisted(message)
  ) {
    return false;
  }

  return punish(message);
}

module.exports = {
  handleMessage
};
