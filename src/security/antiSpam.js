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

const messageHistory =
  new Map();

async function isWhitelisted(
  message,
  type
) {
  if (
    await channelWhitelist.has(
      message.channel.id,
      type
    )
  ) {
    return true;
  }

  if (
    await userWhitelist.has(
      message.author.id,
      type
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
    type
  );
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(
      /<a?:\w+:\d+>/g,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  if (a === b) {
    return 0;
  }

  if (!a.length) {
    return b.length;
  }

  if (!b.length) {
    return a.length;
  }

  const matrix =
    Array.from(
      {
        length: a.length + 1
      },
      () =>
        new Array(
          b.length + 1
        ).fill(0)
    );

  for (
    let i = 0;
    i <= a.length;
    i++
  ) {
    matrix[i][0] = i;
  }

  for (
    let j = 0;
    j <= b.length;
    j++
  ) {
    matrix[0][j] = j;
  }

  for (
    let i = 1;
    i <= a.length;
    i++
  ) {
    for (
      let j = 1;
      j <= b.length;
      j++
    ) {
      const cost =
        a[i - 1] === b[j - 1]
          ? 0
          : 1;

      matrix[i][j] =
        Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] +
            cost
        );
    }
  }

  return matrix[a.length][b.length];
}

function similarity(a, b) {
  if (!a || !b) {
    return 0;
  }

  if (a === b) {
    return 1;
  }

  const maxLength =
    Math.max(
      a.length,
      b.length
    );

  if (!maxLength) {
    return 1;
  }

  return (
    1 -
    levenshtein(a, b) /
      maxLength
  );
}

function countEmojis(text) {
  const custom =
    text.match(
      /<a?:\w+:\d+>/g
    ) || [];

  const unicode =
    text.match(
      /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu
    ) || [];

  return (
    custom.length +
    unicode.length
  );
}

async function punish(
  message,
  reason
) {
  try {
    await message.delete();
  } catch {}

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
          value: reason,
          inline: true
        }
      ]
    }
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

  /*
   * =========================
   * LONG MESSAGE
   * =========================
   */

  if (
    message.content.length >
      config.maxMessageLength &&
    !(await isWhitelisted(
      message,
      "Long Message"
    ))
  ) {
    await punish(
      message,
      `Long Message — exceeded ${config.maxMessageLength} characters`
    );

    return;
  }

  /*
   * =========================
   * MENTION SPAM
   * =========================
   */

  const mentionCount =
    message.mentions.users.size +
    message.mentions.roles.size +
    message.mentions.channels.size +
    (message.mentions.everyone
      ? 1
      : 0);

  if (
    mentionCount >
      config.mentionLimit &&
    !(await isWhitelisted(
      message,
      "Mention"
    ))
  ) {
    await punish(
      message,
      `Mention Spam — ${mentionCount} mentions`
    );

    return;
  }

  /*
   * =========================
   * EMOJI SPAM
   * =========================
   */

  const emojiCount =
    countEmojis(
      message.content
    );

  if (
    emojiCount >
      config.emojiLimit &&
    !(await isWhitelisted(
      message,
      "Emoji"
    ))
  ) {
    await punish(
      message,
      `Emoji Spam — ${emojiCount} emojis`
    );

    return;
  }

  /*
   * =========================
   * SIMILAR MESSAGE SPAM
   * =========================
   */

  if (
    await isWhitelisted(
      message,
      "Spam"
    )
  ) {
    return;
  }

  const key =
    `${message.guild.id}:` +
    `${message.channel.id}:` +
    `${message.author.id}`;

  const content =
    normalize(
      message.content
    );

  if (!content) {
    return;
  }

  if (
    !messageHistory.has(key)
  ) {
    messageHistory.set(
      key,
      []
    );
  }

  const now =
    Date.now();

  const recent =
    messageHistory
      .get(key)
      .filter(
        item =>
          now - item.time <
          30000
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
        ) >=
        config.similarityThreshold
    ).length;

  messageHistory.set(
    key,
    recent.slice(-10)
  );

  /*
   * 1st, 2nd, 3rd = allowed
   * 4th = punishment
   */

  if (
    similarCount >=
    config.spamLimit
  ) {
    await punish(
      message,
      "Spam — sent the same/similar message 4 times"
    );

    messageHistory.delete(
      key
    );
  }
}

module.exports = {
  handleMessage,
  countEmojis,
  similarity
};
