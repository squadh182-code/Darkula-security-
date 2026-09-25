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
  /(discord\.gg\/|discord\.com\/invite\/|discordapp\.com\/invite\/)/i;

const linkRegex =
  /https?:\/\/[^\s]+/i;

async function isWhitelisted(
  message
) {
  if (
    await channelWhitelist.has(
      message.channel.id,
      "Invite"
    )
  ) {
    return true;
  }

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
    await isWhitelisted(message)
  ) {
    return;
  }

  const content =
    message.content || "";

  const containsInvite =
    inviteRegex.test(content);

  const containsLink =
    linkRegex.test(content);

  if (
    !containsInvite &&
    !containsLink
  ) {
    return;
  }

  try {
    await message.delete();
  } catch {}

  const success =
    await timeoutMember(
      message.member,
      config.timeoutDuration,
      "Unauthorized invite/link"
    );

  if (success) {
    await message.channel
      .send({
        content:
          `⚠️ ${message.author} has been timed out for 5 minutes.\n` +
          `Reason: Unauthorized invite/link.`
      })
      .catch(() => {});
  }

  await securityLog(
    message.guild,
    {
      title: "User Timed Out",
      color: 0xFFA500,
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
          value:
            "Unauthorized invite/link",
          inline: true
        }
      ]
    }
  );
}

module.exports = {
  handleMessage
};
