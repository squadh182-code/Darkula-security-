const {
  SlashCommandBuilder
} = require("discord.js");

const {
  joinChannel
} = require("../voice/voiceManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription(
      "Join your current voice channel"
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content:
          "❌ This command can only be used in a server.",
        ephemeral: true
      });
    }

    const member =
      await interaction.guild.members.fetch(
        interaction.user.id
      );

    const voiceChannel =
      member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content:
          "❌ আগে একটা voice channel-এ join হও.",
        ephemeral: true
      });
    }

    try {
      joinChannel(voiceChannel);

      return interaction.reply({
        content:
          `✅ Joined ${voiceChannel}.`
      });
    } catch (error) {
      console.error(
        "❌ Voice join failed:",
        error
      );

      return interaction.reply({
        content:
          "❌ Voice channel-এ join করতে পারলাম না.",
        ephemeral: true
      });
    }
  }
};
