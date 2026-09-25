const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
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
    .setName("whitelist")
    .setDescription(
      "Manage user security whitelists."
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )

    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription(
          "Add a user whitelist."
        )
        .addUserOption(option =>
          option
            .setName("user")
            .setDescription(
              "User to whitelist."
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
          "Remove a user whitelist."
        )
        .addUserOption(option =>
          option
            .setName("user")
            .setDescription(
              "User to remove from whitelist."
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
          "List user whitelists."
        )
    );

async function execute(interaction) {
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

    const embed =
      new EmbedBuilder()
        .setTitle(
          "User Whitelist Added"
        )
        .setDescription(
          `${user} has been whitelisted for **${type}** protection.`
        )
        .setColor(0x57F287)
        .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
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

    const embed =
      new EmbedBuilder()
        .setTitle(
          removed
            ? "User Whitelist Removed"
            : "Whitelist Not Found"
        )
        .setDescription(
          removed
            ? `Removed **${type}** whitelist from ${user}.`
            : `No **${type}** whitelist was found for ${user}.`
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
      await userWhitelist.list();

    const embed =
      new EmbedBuilder()
        .setTitle("User Whitelist")
        .setColor(0x5865F2)
        .setTimestamp();

    if (!rows.length) {
      embed.setDescription(
        "No user whitelists are configured."
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
            ([userId, types]) =>
              `<@${userId}> — ${types.join(", ")}`
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
