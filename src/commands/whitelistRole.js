const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-role")
    .setDescription("Manage role whitelist")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a role to whitelist")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("Role to whitelist")
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
        .setDescription("Remove a role from whitelist")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("Role to remove")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("Show whitelisted roles")
    ),

  async execute(interaction) {
    await interaction.reply({
      content: "🛡️ Role whitelist system is being connected.",
      ephemeral: true
    });
  }
};
