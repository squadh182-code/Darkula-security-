const {
  SlashCommandBuilder
} = require("discord.js");

const userWhitelist =
  require("../whitelist/userWhitelist");

const TYPES = [
  "All",
  "Channel Delete",
  "Channel Create",
  "Role Delete",
  "Role Create",
  "Role Update",
  "Bot Add",
  "Invite",
  "Spam",
  "Mention",
  "Emoji",
  "Long Message"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("Manage user whitelist")

    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription("Add a user to the whitelist")

        .addUserOption(option =>
          option
            .setName("user")
            .setDescription("User to whitelist")
            .setRequired(true)
        )

        .addStringOption(option =>
          option
            .setName("type")
            .setDescription("Protection type")
            .setRequired(true)
            .addChoices(
              ...TYPES.map(type => ({
                name: type,
                value: type
              }))
            )
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("Remove a user from the whitelist")

        .addUserOption(option =>
          option
            .setName("user")
            .setDescription("User to remove")
            .setRequired(true)
        )

        .addStringOption(option =>
          option
            .setName("type")
            .setDescription("Whitelist type to remove")
            .setRequired(true)
            .addChoices(
              ...TYPES.map(type => ({
                name: type,
                value: type
              }))
            )
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("list")
        .setDescription("List whitelisted users")
    ),

  async execute(interaction) {
    const subcommand =
      interaction.options.getSubcommand();

    if (subcommand === "add") {
      const user =
        interaction.options.getUser("user");

      const type =
        interaction.options.getString("type");

      await userWhitelist.add(
        user.id,
        type
      );

      return interaction.reply(
        `✅ ${user} has been whitelisted for **${type}**.`
      );
    }

    if (subcommand === "remove") {
      const user =
        interaction.options.getUser("user");

      const type =
        interaction.options.getString("type");

      const removed =
        await userWhitelist.remove(
          user.id,
          type
        );

      if (!removed) {
        return interaction.reply(
          `❌ ${user} does not have the **${type}** whitelist.`
        );
      }

      return interaction.reply(
        `✅ Removed **${type}** whitelist from ${user}.`
      );
    }

    if (subcommand === "list") {
      const rows =
        await userWhitelist.list();

      if (!rows.length) {
        return interaction.reply(
          "📋 No users are currently whitelisted."
        );
      }

      const grouped =
        new Map();

      for (const row of rows) {
        if (!grouped.has(row.target_id)) {
          grouped.set(
            row.target_id,
            []
          );
        }

        grouped
          .get(row.target_id)
          .push(row.whitelist_type);
      }

      const text =
        [...grouped.entries()]
          .map(
            ([id, types]) =>
              `<@${id}> — ${types.join(", ")}`
          )
          .join("\n");

      return interaction.reply(
        `📋 **Whitelisted Users**\n\n${text}`
      );
    }
  }
};
