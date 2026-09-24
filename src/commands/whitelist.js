const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("Manage user whitelist")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a user to whitelist")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User to whitelist")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Protection type")
            .setRequired(true)
            .addChoices(
              { name: "All", value: "All" },
              { name: "Channel Delete", value: "Channel Delete" },
              { name: "Channel Create", value: "Channel Create" },
              { name: "Role Delete", value: "Role Delete" },
              { name: "Role Create", value: "Role Create" },
              { name: "Role Update", value: "Role Update" },
              { name: "Bot Add", value: "Bot Add" },
              { name: "Invite", value: "Invite" },
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
        .setDescription("Remove a user from whitelist")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User to remove")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("Show whitelisted users")
    ),

  async execute(interaction) {
    await interaction.reply({
      content: "🛡️ Whitelist system is being connected.",
      ephemeral: true
    });
  }
};
