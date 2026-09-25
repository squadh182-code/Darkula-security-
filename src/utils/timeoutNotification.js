const {
  EmbedBuilder
} = require("discord.js");

async function sendTimeoutNotification(
  message,
  reason,
  duration = "5 minutes"
) {
  if (!message?.channel) {
    return;
  }

  const embed =
    new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle("⚠️ Member Timed Out")
      .setDescription(
        `${message.author} has been timed out for **${duration}**.`
      )
      .addFields(
        {
          name: "User",
          value:
            `${message.author}\n\`${message.author.id}\``,
          inline: true
        },
        {
          name: "Duration",
          value: duration,
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
      )
      .setThumbnail(
        message.author.displayAvatarURL({
          dynamic: true
        })
      )
      .setTimestamp();

  try {
    await message.channel.send({
      embeds: [embed]
    });
  } catch (error) {
    console.error(
      "❌ Failed to send timeout embed:",
      error
    );
  }
}

module.exports = {
  sendTimeoutNotification
};
