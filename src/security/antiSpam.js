const config = require("../config/config");
const { timeoutMember } = require("../utils/timeout");
const securityLog = require("../utils/securityLog");
const channelWhitelist = require("../whitelist/channelWhitelist");
const userWhitelist = require("../whitelist/userWhitelist");
const roleWhitelist = require("../whitelist/roleWhitelist");

const messageHistory = new Map();

function isWhitelisted(message, type) {
  if (
    channelWhitelist.has(message.channel.id, type)
  ) {
    return true;
  }

  if (
    userWhitelist.has(message.author.id, type)
  ) {
    return true;
  }

  const roleIds = message.member?.roles?.cache
    ? [...message.member.roles.cache.keys()]
    : [];

  return roleWhitelist.has(roleIds, type);
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/<a?:\w+:\d+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const longer = a.length >= b.length ? a : b;
  const shorter = a.length >= b.length ? b : a;

  let same = 0;

  for (const char of shorter) {
    if (longer.includes(char)) {
      same++;
    }
  }

  return same / longer.length;
}

function countEmojis(text) {
  const custom =
    text.match(/<a?:\w+:\d+>/g) || [];

  const unicode =
    text.match(
      /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu
    ) || [];

  return custom.length + unicode.length;
}

async function punish(message, reason) {
  try {
    await message.delete();
  } catch {}

  const success = await timeoutMember(
    message.member,
    config.timeoutDuration,
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
    color: 0xFFA500,
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

async function handleMessage(message) {
  if (!message.guild || message.author.bot) return;

  // LONG MESSAGE
  if (
    message.content.length >
    config.maxMessageLength &&
    !isWhitelisted(message, "Long Message")
  ) {
    await punish(
      message,
      `Long Message — exceeded ${config.maxMessageLength} characters`
    );
    return;
  }

  // MENTION
  const mentionCount =
    message.mentions.users.size +
    message.mentions.roles.size +
    message.mentions.channels.size +
    (message.mentions.everyone ? 1 : 0);

  if (
    mentionCount > config.mentionLimit &&
    !isWhitelisted(message, "Mention")
  ) {
    await punish(
      message,
      `Mention Spam — ${mentionCount} mentions`
    );
    return;
  }

  // EMOJI
  const emojiCount =
    countEmojis(message.content);

  if (
    emojiCount > config.emojiLimit &&
    !isWhitelisted(message, "Emoji")
  ) {
    await punish(
      message,
      `Emoji Spam — ${emojiCount} emojis`
    );
    return;
  }

  // SIMILAR MESSAGE SPAM
  if (isWhitelisted(message, "Spam")) {
    return;
  }

  const key =
    `${message.guild.id}:` +
    `${message.channel.id}:` +
    `${message.author.id}`;

  const content =
    normalize(message.content);

  if (!content) return;

  if (!messageHistory.has(key)) {
    messageHistory.set(key, []);
  }

  const now = Date.now();

  const recent =
    messageHistory
      .get(key)
      .filter(
        item => now - item.time < 30000
      );

  recent.push({
    content,
    time: now
  });

  const similarCount =
    recent.filter(
      item =>
        similarity(
          item.content,
          content
        ) >= config.similarityThreshold
    ).length;

  messageHistory.set(
    key,
    recent.slice(-10)
  );

  if (
    similarCount >= config.spamLimit
  ) {
    await punish(
      message,
      "Spam — sent the same/similar message 4 times"
    );

    messageHistory.delete(key);
  }
}

module.exports = {
  handleMessage,
  countEmojis
};
