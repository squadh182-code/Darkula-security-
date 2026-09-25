const {
  ActivityType
} = require("discord.js");

module.exports = (client) => {
  client.once("ready", () => {
    console.log(
      `✅ Logged in as ${client.user.tag}`
    );

    console.log(
      "🛡️ Security Bot is online"
    );

    client.user.setPresence({
      activities: [
        {
          name: "Bᴜᴛᴛᴀ Sʟᴇᴇᴘ....",
          type: ActivityType.Playing
        }
      ],
      status: "online"
    });

    console.log(
      "🎮 Bot status set: Bᴜᴛᴛᴀ Sʟᴇᴇᴘ...."
    );
  });
};
