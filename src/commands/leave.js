const {
  SlashCommandBuilder
} = require("discord.js");

const {
  leaveChannel
} = require("../voice/voiceManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the voice channel"),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "❌ This command can only be used in a server.",
        ephemeral: true
      });
    }

    const left = leaveChannel(
      interaction.guild.id
    );

    if (!left) {
      return interaction.reply({
        content: "❌ I am not currently in a voice channel.",
        ephemeral: true
      });
    }

    return interaction.reply({
      content: "👋 Left the voice channel."
    });
  }
};
