const {
  SlashCommandBuilder,
  ChannelType
} = require("discord.js");

const channelWhitelist =
  require("../whitelist/channelWhitelist");

const TYPES = [
  "All",
  "Invite",
  "Spam",
  "Mention",
  "Emoji",
  "Long Message"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist-channel")
    .setDescription("Manage channel whitelist")
    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription("Add a channel to the whitelist")
        .addChannelOption(option =>
          option
            .setName("channel")
            .setDescription("Channel to whitelist")
            .setRequired(true)
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
              ChannelType.GuildForum
            )
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
        .setDescription("Remove a channel from the whitelist")
        .addChannelOption(option =>
          option
            .setName("channel")
            .setDescription("Channel to remove")
            .setRequired(true)
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
              ChannelType.GuildForum
            )
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
        .setDescription("List whitelisted channels")
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

      return interaction.reply(
        `✅ ${channel} has been whitelisted for **${type}**.`
      );
    }

    if (subcommand === "remove") {
      const channel =
        interaction.options.getChannel("channel");

      const type =
        interaction.options.getString("type");

      const removed =
        channelWhitelist.remove(
          channel.id,
          type
        );

      if (!removed) {
        return interaction.reply(
          `❌ ${channel} does not have the **${type}** whitelist.`
        );
      }

      return interaction.reply(
        `✅ Removed **${type}** whitelist from ${channel}.`
      );
    }

    if (subcommand === "list") {
      const list =
        channelWhitelist.list();

      if (!list.length) {
        return interaction.reply(
          "📋 No channels are currently whitelisted."
        );
      }

      const text = list
        .map(item =>
          `<#${item.id}> — ${item.types.join(", ")}`
        )
        .join("\n");

      return interaction.reply(
        `📋 **Whitelisted Channels**\n\n${text}`
      );
    }
  }
};
