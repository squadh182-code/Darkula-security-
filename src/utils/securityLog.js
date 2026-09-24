async function securityLog(guild, data) {
  if (!guild || !data) return;

  const channelId = data.channelId;

  if (!channelId) {
    console.log("⚠️ Security log channel ID not configured.");
    return;
  }

  const channel = guild.channels.cache.get(channelId);

  if (!channel) {
    console.log("❌ Security log channel not found.");
    return;
  }

  try {
    await channel.send({
      content: data.message || "🛡️ Security Action"
    });
  } catch (error) {
    console.error("❌ Failed to send security log:", error);
  }
}

module.exports = securityLog;
