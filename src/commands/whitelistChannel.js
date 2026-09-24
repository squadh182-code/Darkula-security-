const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const channelWhitelist =
  require("../whitelist/channelWhitelist");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-channel")
    .setDescription("Manage channel whitelist")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add a channel")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel")
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
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove a channel")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("list")
        .setDescription("Show channel whitelist")
    ),

  async execute(interaction) {
    const subcommand =
      interaction.options.getSubcommand();

    if (subcommand === "add") {
      const channel =
        interaction.options.getChannel("channel");

      const type =
        interaction.options.getString("type");

      channelWhitelist.add(
        channel.id,
        type
      );

      return interaction.reply({
        content:
          `✅ ${channel} added to channel whitelist.\n` +
          `Protection: **${type}**`,
        ephemeral: true
      });
    }

    if (subcommand === "remove") {
      const channel =
        interaction.options.getChannel("channel");

      channelWhitelist.remove(channel.id);

      return interaction.reply({
        content:
          `✅ ${channel} removed from channel whitelist.`,
        ephemeral: true
      });
    }

    const list =
      channelWhitelist.list();

    if (!list.length) {
      return interaction.reply({
        content:
          "📋 Channel whitelist is empty.",
        ephemeral: true
      });
    }

    const text = list
      .map(
        ([id, type]) =>
          `<#${id}> — **${type}**`
      )
      .join("\n");

    return interaction.reply({
      content:
        `📋 **Channel Whitelist**\n\n${text}`,
      ephemeral: true
    });
  }
};
