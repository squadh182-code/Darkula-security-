const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const channelWhitelist =
  require("../whitelist/channelWhitelist");

const TYPES = [
  "All",
  "Invite",
  "Instagram",
  "YouTube",
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
    .setName("whitelist-channel")
    .setDescription(
      "Manage channel security whitelists."
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )

    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription(
          "Add a channel whitelist."
        )
        .addChannelOption(option =>
          option
            .setName("channel")
            .setDescription(
              "Channel to whitelist."
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
          "Remove a channel whitelist."
        )
        .addChannelOption(option =>
          option
            .setName("channel")
            .setDescription(
              "Channel to remove from whitelist."
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
          "List channel whitelists."
        )
    );

async function execute(interaction) {
  const subcommand =
    interaction.options.getSubcommand();

  if (subcommand === "add") {
    const channel =
      interaction.options.getChannel("channel");

    const type =
      interaction.options.getString("type");

    await channelWhitelist.add(
      channel.id,
      type
    );

    const embed =
      new EmbedBuilder()
        .setTitle(
          "Channel Whitelist Added"
        )
        .setDescription(
          `${channel} has been whitelisted for **${type}** protection.`
        )
        .setColor(0x57F287)
        .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }

  if (subcommand === "remove") {
    const channel =
      interaction.options.getChannel("channel");

    const type =
      interaction.options.getString("type");

    const removed =
      await channelWhitelist.remove(
        channel.id,
        type
      );

    const embed =
      new EmbedBuilder()
        .setTitle(
          removed
            ? "Channel Whitelist Removed"
            : "Whitelist Not Found"
        )
        .setDescription(
          removed
            ? `Removed **${type}** whitelist from ${channel}.`
            : `No **${type}** whitelist was found for ${channel}.`
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
      await channelWhitelist.list();

    const embed =
      new EmbedBuilder()
        .setTitle("Channel Whitelist")
        .setColor(0x5865F2)
        .setTimestamp();

    if (!rows.length) {
      embed.setDescription(
        "No channel whitelists are configured."
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
            ([channelId, types]) =>
              `<#${channelId}> — ${types.join(", ")}`
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
