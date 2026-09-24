const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const roleWhitelist =
  require("../whitelist/roleWhitelist");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-role")
    .setDescription("Manage role whitelist")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add a role")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("Role")
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
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove a role")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("Role")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("list")
        .setDescription("Show role whitelist")
    ),

  async execute(interaction) {
    const subcommand =
      interaction.options.getSubcommand();

    if (subcommand === "add") {
      const role =
        interaction.options.getRole("role");

      const type =
        interaction.options.getString("type");

      roleWhitelist.add(role.id, type);

      return interaction.reply({
        content:
          `✅ ${role} added to role whitelist.\n` +
          `Protection: **${type}**`,
        ephemeral: true
      });
    }

    if (subcommand === "remove") {
      const role =
        interaction.options.getRole("role");

      roleWhitelist.remove(role.id);

      return interaction.reply({
        content:
          `✅ ${role} removed from role whitelist.`,
        ephemeral: true
      });
    }

    const list = roleWhitelist.list();

    if (!list.length) {
      return interaction.reply({
        content: "📋 Role whitelist is empty.",
        ephemeral: true
      });
    }

    const text = list
      .map(
        ([id, type]) =>
          `<@&${id}> — **${type}**`
      )
      .join("\n");

    return interaction.reply({
      content:
        `📋 **Role Whitelist**\n\n${text}`,
      ephemeral: true
    });
  }
};
