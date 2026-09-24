const {
  SlashCommandBuilder
} = require("discord.js");

const {
  leaveChannel
} = require("../voice/voiceManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription(
      "Leave the current voice channel"
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content:
          "❌ This command can only be used in a server.",
        ephemeral: true
      });
    }

    const left =
      leaveChannel(
        interaction.guild.id
      );

    if (!left) {
      return interaction.reply({
        content:
          "❌ Bot কোনো voice channel-এ নেই.",
        ephemeral: true
      });
    }

    return interaction.reply({
      content:
        "👋 Left the voice channel."
    });
  }
};
