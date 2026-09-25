const config =
  require("../config/config");

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
  // English
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

  // Common Romanized Bangla profanity
  "banchod",
  "bal",
  "baal",
  "bokachoda",
  "chod",
  "choda",
  "chodna",
  "chodon",
  "harami",
  "kuttarbaccha",
  "kuttar bachcha",
  "shuarer baccha",
  "shuarer bachcha",
  "magibaj",
  "khanki",
  "khan**",
  "madarchod",
  "magi",
  "bosti",
  "gadha",

  // Hindi / Roman Hindi
  "madarchod",
  "madharchod",
  "bhenchod",
  "behenchod",
  "chutiya",
  "chutiye",
  "gaand",
  "gandu",
  "harami",
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
   BANGLA SCRIPT
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
    .replace(/[\s\-_.,!?'"`~@#$%^&*()[\]{}:;|\\/+=<>]/g, "")
    .trim();
}

/* =========================
   DETECTION
========================= */

function containsBadWord(content) {
  if (!content) {
    return null;
  }

  /* Bangla script */

  for (
    const pattern of BANGLA_BAD_WORD_PATTERNS
  ) {
    if (pattern.test(content)) {
      return "Bangla profanity";
    }
  }

  /* Roman / English */

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
