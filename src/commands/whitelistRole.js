const {
  SlashCommandBuilder
} = require("discord.js");

const roleWhitelist =
  require("../whitelist/roleWhitelist");

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
    .setName("whitelist-role")
    .setDescription("Manage role whitelist")
    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription("Add a role to the whitelist")
        .addRoleOption(option =>
          option
            .setName("role")
            .setDescription("Role to whitelist")
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
        .setDescription("Remove a role from the whitelist")
        .addRoleOption(option =>
          option
            .setName("role")
            .setDescription("Role to remove")
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
        .setDescription("List whitelisted roles")
    ),

  async execute(interaction) {
    const subcommand =
      interaction.options.getSubcommand();

    if (subcommand === "add") {
      const role =
        interaction.options.getRole("role");

      const type =
        interaction.options.getString("type");

      roleWhitelist.add(
        role.id,
        type
      );

      return interaction.reply(
        `✅ ${role} has been whitelisted for **${type}**.`
      );
    }

    if (subcommand === "remove") {
      const role =
        interaction.options.getRole("role");

      const type =
        interaction.options.getString("type");

      const removed =
        roleWhitelist.remove(
          role.id,
          type
        );

      if (!removed) {
        return interaction.reply(
          `❌ ${role} does not have the **${type}** whitelist.`
        );
      }

      return interaction.reply(
        `✅ Removed **${type}** whitelist from ${role}.`
      );
    }

    if (subcommand === "list") {
      const list =
        roleWhitelist.list();

      if (!list.length) {
        return interaction.reply(
          "📋 No roles are currently whitelisted."
        );
      }

      const text = list
        .map(item =>
          `<@&${item.id}> — ${item.types.join(", ")}`
        )
        .join("\n");

      return interaction.reply(
        `📋 **Whitelisted Roles**\n\n${text}`
      );
    }
  }
};
