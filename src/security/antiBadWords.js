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
   BAD WORD LIST
========================= */

const BAD_WORDS = [
  "fuck",
  "fucker",
  "fucking",
  "motherfucker",
  "shit",
  "bullshit",
  "bitch",
  "bastard",
  "asshole",
  "dumbass",
  "jackass",
  "dick",
  "dickhead",
  "piss",
  "cunt",
  "slut",
  "whore",

  "banchod",
  "bal",
  "baal",
  "bokachoda",
  "chod",
  "choda",
  "chodna",
  "harami",
  "kuttarbaccha",
  "kuttar bachcha",
  "shuarer baccha",
  "shuarer bachcha",
  "magibaj",
  "khanki",
  "magi",
  "bosti",
  "gadha",

  "madarchod",
  "madharchod",
  "bhenchod",
  "behenchod",
  "chutiya",
  "chutiye",
  "gaand",
  "gandu",
  "kamina",
  "kamine",
  "randi",
  "lund",
  "lavde",
  "bsdk",
  "mc",
  "bc"
];

/* =========================
   BANGLA
========================= */

const BANGLA_BAD_WORD_PATTERNS = [
  /বাল/i,
  /বালছাল/i,
  /বোকাচোদ/i,
  /চোদ/i,
  /চোদনা/i,
  /হারামি/i,
  /খানকি/i,
  /মাগি/i,
  /গাধা/i,
  /কুত্তারবাচ্চা/i,
  /শুয়োরেরবাচ্চা/i
];

/* =========================
   NORMALIZE
========================= */

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(
      /[\s\-_.,!?'"`~@#$%^&*()[\]{}:;|\\/+=<>]/g,
      ""
    )
    .trim();
}

/* =========================
   DETECTION
========================= */

function containsBadWord(content) {
  if (!content) {
    return null;
  }

  for (
    const pattern of BANGLA_BAD_WORD_PATTERNS
  ) {
    if (pattern.test(content)) {
      return "Bangla profanity";
    }
  }

  const normalized =
    normalizeText(content);

  for (
    const word of BAD_WORDS
  ) {
    const normalizedWord =
      normalizeText(word);

    if (
      normalized.includes(
        normalizedWord
      )
    ) {
      return "Profanity";
    }
  }

  return null;
}

/* =========================
   WHITELIST
========================= */

async function isWhitelisted(message) {
  if (
    await userWhitelist.has(
      message.author.id,
      "Bad Words"
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
      "Bad Words"
    )
  ) {
    return true;
  }

  if (
    await channelWhitelist.has(
      message.channel.id,
      "Bad Words"
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
   MAIN
========================= */

async function handleMessage(message) {
  if (!message.guild) {
    return false;
  }

  if (message.author.bot) {
    return false;
  }

  if (!message.content) {
    return false;
  }

  if (
    await isWhitelisted(message)
  ) {
    return false;
  }

  const detected =
    containsBadWord(
      message.content
    );

  if (!detected) {
    return false;
  }

  return punish(
    message,
    "Use of prohibited language."
  );
}

module.exports = {
  handleMessage,
  containsBadWord
};
