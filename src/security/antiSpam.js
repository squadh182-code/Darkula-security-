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

const messageHistory =
  new Map();

/* =========================
   NORMALIZE
========================= */

function normalizeMessage(content) {
  return content
    .toLowerCase()
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================
   SIMILARITY
========================= */

function similarity(a, b) {
  if (!a || !b) {
    return 0;
  }

  if (a === b) {
    return 1;
  }

  const longer =
    a.length >= b.length ? a : b;

  const shorter =
    a.length >= b.length ? b : a;

  const distance =
    levenshteinDistance(
      longer,
      shorter
    );

  return (
    (longer.length - distance) /
    longer.length
  );
}

function levenshteinDistance(a, b) {
  const matrix =
    Array.from(
      {
        length: b.length + 1
      },
      () =>
        Array(
          a.length + 1
        ).fill(0)
    );

  for (
    let i = 0;
    i <= b.length;
    i++
  ) {
    matrix[i][0] = i;
  }

  for (
    let j = 0;
    j <= a.length;
    j++
  ) {
    matrix[0][j] = j;
  }

  for (
    let i = 1;
    i <= b.length;
    i++
  ) {
    for (
      let j = 1;
      j <= a.length;
      j++
    ) {
      if (
        b[i - 1] ===
        a[j - 1]
      ) {
        matrix[i][j] =
          matrix[i - 1][j];
      } else {
        matrix[i][j] =
          Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + 1
          );
      }
    }
  }

  return matrix[b.length][a.length];
}

/* =========================
   ROLES
========================= */

function getRoleIds(member) {
  if (!member?.roles?.cache) {
    return [];
  }

  return [
    ...member.roles.cache.keys()
  ];
}

/* =========================
   WHITELIST
========================= */

async function isWhitelisted(
  message,
  type
) {
  if (
    await userWhitelist.has(
      message.author.id,
      type
    )
  ) {
    return true;
  }

  const roleIds =
    getRoleIds(message.member);

  if (
    roleIds.length &&
    await roleWhitelist.has(
      roleIds,
      type
    )
  ) {
    return true;
  }

  if (
    await channelWhitelist.has(
      message.channel.id,
      type
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
  message,
  reason
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
   MENTIONS
========================= */

function countMentions(message) {
  let count = 0;

  count +=
    message.mentions.users.size;

  count +=
    message.mentions.roles.size;

  if (message.mentions.everyone) {
    count += 1;
  }

  return count;
}

/* =========================
   EMOJIS
========================= */

function countEmojis(content) {
  const customEmojis =
    content.match(
      /<a?:\w+:\d+>/g
    ) || [];

  const unicodeEmojis =
    content.match(
      /\p{Extended_Pictographic}/gu
    ) || [];

  return (
    customEmojis.length +
    unicodeEmojis.length
  );
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

  if (!message.member) {
    return false;
  }

  /* LONG MESSAGE */

  if (
    message.content.length >
    config.maxMessageLength
  ) {
    if (
      !(await isWhitelisted(
        message,
        "Long Message"
      ))
    ) {
      return punish(
        message,
        `Long Message — exceeded the maximum limit of ${config.maxMessageLength} characters.`
      );
    }

    return false;
  }

  /* MENTION SPAM */

  const mentionCount =
    countMentions(message);

  if (
    mentionCount >
    config.mentionLimit
  ) {
    if (
      !(await isWhitelisted(
        message,
        "Mention"
      ))
    ) {
      return punish(
        message,
        `Mention Spam — sent ${mentionCount} mentions.`
      );
    }

    return false;
  }

  /* EMOJI SPAM */

  const emojiCount =
    countEmojis(
      message.content
    );

  if (
    emojiCount >
    config.emojiLimit
  ) {
    if (
      !(await isWhitelisted(
        message,
        "Emoji"
      ))
    ) {
      return punish(
        message,
        `Emoji Spam — sent ${emojiCount} emojis.`
      );
    }

    return false;
  }

  /* SIMILAR MESSAGE */

  const normalized =
    normalizeMessage(
      message.content
    );

  if (!normalized) {
    return false;
  }

  const key =
    `${message.guild.id}:${message.author.id}`;

  if (!messageHistory.has(key)) {
    messageHistory.set(
      key,
      []
    );
  }

  const history =
    messageHistory.get(key);

  let similarCount = 1;

  for (
    const previous of history
  ) {
    if (
      similarity(
        normalized,
        previous
      ) >=
      config.similarityThreshold
    ) {
      similarCount++;
    }
  }

  history.push(normalized);

  if (history.length > 10) {
    history.shift();
  }

  if (
    similarCount >=
    config.spamLimit
  ) {
    if (
      !(await isWhitelisted(
        message,
        "Spam"
      ))
    ) {
      return punish(
        message,
        `Spam — sent the same/similar message ${similarCount} times.`
      );
    }
  }

  return false;
}

module.exports = {
  handleMessage
};
