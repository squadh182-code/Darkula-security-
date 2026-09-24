const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const userWhitelist =
  require("../whitelist/userWhitelist");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("Manage user whitelist")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add a user to whitelist")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User")
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
        .setDescription("Remove a user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("User")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("list")
        .setDescription("Show user whitelist")
    ),

  async execute(interaction) {
    const subcommand =
      interaction.options.getSubcommand();

    if (subcommand === "add") {
      const user =
        interaction.options.getUser("user");

      const type =
        interaction.options.getString("type");

      userWhitelist.add(user.id, type);

      return interaction.reply({
        content:
          `✅ ${user} added to user whitelist.\n` +
          `Protection: **${type}**`,
        ephemeral: true
      });
    }

    if (subcommand === "remove") {
      const user =
        interaction.options.getUser("user");

      userWhitelist.remove(user.id);

      return interaction.reply({
        content:
          `✅ ${user} removed from user whitelist.`,
        ephemeral: true
      });
    }

    const list = userWhitelist.list();

    if (!list.length) {
      return interaction.reply({
        content: "📋 User whitelist is empty.",
        ephemeral: true
      });
    }

    const text = list
      .map(
        ([id, type]) =>
          `<@${id}> — **${type}**`
      )
      .join("\n");

    return interaction.reply({
      content:
        `📋 **User Whitelist**\n\n${text}`,
      ephemeral: true
    });
  }
};
