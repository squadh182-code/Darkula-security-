const config = {
  botRoleId: "1401958482264985621",

  securityLogChannelId:
    "1552785563369742437",

  guildId:
    "1397974278934106182",

  timeoutDuration:
    5 * 60 * 1000,

  // Spam protection
  spamLimit: 4,

  // Mention protection
  mentionLimit: 3,

  // Emoji protection
  emojiLimit: 3,

  // Long message protection
  maxMessageLength: 500,

  // Similar message detection
  similarityThreshold: 0.85
};

module.exports = config;
