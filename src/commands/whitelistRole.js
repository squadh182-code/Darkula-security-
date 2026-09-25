const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
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
  "Long Message",
  "Bad Words"
];

const typeChoices =
  TYPES.map(type => ({
    name: type,
    value: type
  }));

const data =
  new SlashCommandBuilder()
    .setName("whitelist-role")
    .setDescription(
      "Manage role security whitelists."
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )

    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription(
          "Add a role whitelist."
        )
        .addRoleOption(option =>
          option
            .setName("role")
            .setDescription(
              "Role to whitelist."
            )
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("type")
            .setDescription(
              "Protection type to whitelist."
            )
            .setRequired(true)
            .addChoices(
              ...typeChoices
            )
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription(
          "Remove a role whitelist."
        )
        .addRoleOption(option =>
          option
            .setName("role")
            .setDescription(
              "Role to remove from whitelist."
            )
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("type")
            .setDescription(
              "Whitelist type to remove."
            )
            .setRequired(true)
            .addChoices(
              ...typeChoices
            )
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("list")
        .setDescription(
          "List role whitelists."
        )
    );

async function execute(interaction) {
  const subcommand =
    interaction.options.getSubcommand();

  if (subcommand === "add") {
    const role =
      interaction.options.getRole("role");

    const type =
      interaction.options.getString("type");

    await roleWhitelist.add(
      role.id,
      type
    );

    const embed =
      new EmbedBuilder()
        .setTitle(
          "Role Whitelist Added"
        )
        .setDescription(
          `${role} has been whitelisted for **${type}** protection.`
        )
        .setColor(0x57F287)
        .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }

  if (subcommand === "remove") {
    const role =
      interaction.options.getRole("role");

    const type =
      interaction.options.getString("type");

    const removed =
      await roleWhitelist.remove(
        role.id,
        type
      );

    const embed =
      new EmbedBuilder()
        .setTitle(
          removed
            ? "Role Whitelist Removed"
            : "Whitelist Not Found"
        )
        .setDescription(
          removed
            ? `Removed **${type}** whitelist from ${role}.`
            : `No **${type}** whitelist was found for ${role}.`
        )
        .setColor(
          removed
            ? 0x57F287
            : 0xED4245
        )
        .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }

  if (subcommand === "list") {
    const rows =
      await roleWhitelist.list();

    const embed =
      new EmbedBuilder()
        .setTitle("Role Whitelist")
        .setColor(0x5865F2)
        .setTimestamp();

    if (!rows.length) {
      embed.setDescription(
        "No role whitelists are configured."
      );
    } else {
      const grouped = {};

      for (const row of rows) {
        if (!grouped[row.target_id]) {
          grouped[row.target_id] = [];
        }

        grouped[row.target_id].push(
          row.whitelist_type
        );
      }

      const description =
        Object.entries(grouped)
          .map(
            ([roleId, types]) =>
              `<@&${roleId}> — ${types.join(", ")}`
          )
          .join("\n");

      embed.setDescription(
        description
      );
    }

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
}

module.exports = {
  data,
  execute
};
