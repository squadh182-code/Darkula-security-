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
          name: "Sʟᴇᴇᴘʏ Dᴀʀᴋᴜʟᴀ — Sᴛɪʟʟ Wᴀᴛᴄʜɪɴɢ Yᴏᴜ.",
          type: ActivityType.Playing
        }
      ],
      status: "dnd"
    });

    console.log(
      "🔴 Bot status set to Do Not Disturb."
    );
  });
};
