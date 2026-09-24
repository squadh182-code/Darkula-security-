const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-channel")
    .setDescription("Manage channel whitelist")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a channel to whitelist")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to whitelist")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Protection type")
            .setRequired(true)
            .addChoices(
              { name: "All", value: "All" },
              { name: "Invite / Link", value: "Invite" },
              { name: "Spam", value: "Spam" },
              { name: "Mention", value: "Mention" },
              { name: "Emoji", value: "Emoji" },
              { name: "Long Message", value: "Long Message" }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a channel from whitelist")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to remove")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("Show whitelisted channels")
    ),

  async execute(interaction) {
    await interaction.reply({
      content: "🛡️ Channel whitelist system is being connected.",
      ephemeral: true
    });
  }
};
