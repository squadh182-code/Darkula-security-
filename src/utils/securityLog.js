const {
  EmbedBuilder
} = require("discord.js");

const config = require("../config/config");

async function securityLog(guild, {
  title,
  description,
  color = 0x5865F2,
  fields = []
}) {
  if (!guild) return;

  const channel = guild.channels.cache.get(
    config.securityLogChannelId
  );

  if (!channel) {
    console.log("❌ Security log channel not found.");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`🛡️ ${title}`)
    .setDescription(description || null)
    .setColor(color)
    .setTimestamp();

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  try {
    await channel.send({
      embeds: [embed]
    });
  } catch (error) {
    console.error("❌ Security log failed:", error);
  }
}

module.exports = securityLog;
