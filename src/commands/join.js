const {
  SlashCommandBuilder
} = require("discord.js");

const {
  joinChannel
} = require("../voice/voiceManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join your current voice channel"),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "❌ This command can only be used in a server.",
        ephemeral: true
      });
    }

    const member = interaction.member;

    const voiceChannel = member?.voice?.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ You must be in a voice channel first.",
        ephemeral: true
      });
    }

    try {
      joinChannel(voiceChannel);

      return interaction.reply({
        content: `✅ Joined ${voiceChannel}.`
      });
    } catch (error) {
      console.error("❌ Voice join failed:", error);

      return interaction.reply({
        content: "❌ I couldn't join the voice channel.",
        ephemeral: true
      });
    }
  }
};
