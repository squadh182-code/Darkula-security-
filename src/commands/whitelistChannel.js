const {
  SlashCommandBuilder
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
    .setDescription(
      "Manage channel whitelist"
    )

    // ADD
    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription(
          "Add a channel to the whitelist"
        )

        .addChannelOption(option =>
          option
            .setName("channel")
            .setDescription(
              "Channel to whitelist"
            )
            .setRequired(true)
        )

        .addStringOption(option =>
          option
            .setName("type")
            .setDescription(
              "Protection type"
            )
            .setRequired(true)
            .addChoices(
              ...TYPES.map(type => ({
                name: type,
                value: type
              }))
            )
        )
    )

    // REMOVE
    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription(
          "Remove a channel from the whitelist"
        )

        .addChannelOption(option =>
          option
            .setName("channel")
            .setDescription(
              "Channel to remove"
            )
            .setRequired(true)
        )

        .addStringOption(option =>
          option
            .setName("type")
            .setDescription(
              "Whitelist type to remove"
            )
            .setRequired(true)
            .addChoices(
              ...TYPES.map(type => ({
                name: type,
                value: type
              }))
            )
        )
    )

    // LIST
    .addSubcommand(sub =>
      sub
        .setName("list")
        .setDescription(
          "List whitelisted channels"
        )
    ),


  async execute(interaction) {

    const subcommand =
      interaction.options.getSubcommand();


    // ADD
    if (subcommand === "add") {

      const channel =
        interaction.options.getChannel(
          "channel"
        );

      const type =
        interaction.options.getString(
          "type"
        );

      await channelWhitelist.add(
        channel.id,
        type
      );

      return interaction.reply(
        `✅ ${channel} has been whitelisted for **${type}**.`
      );
    }


    // REMOVE
    if (subcommand === "remove") {

      const channel =
        interaction.options.getChannel(
          "channel"
        );

      const type =
        interaction.options.getString(
          "type"
        );

      const removed =
        await channelWhitelist.remove(
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


    // LIST
    if (subcommand === "list") {

      const rows =
        await channelWhitelist.list();

      if (!rows.length) {
        return interaction.reply(
          "📋 No channels are currently whitelisted."
        );
      }

      const grouped =
        new Map();

      for (const row of rows) {

        if (!grouped.has(
          row.target_id
        )) {
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
              `<#${id}> — ${types.join(", ")}`
          )
          .join("\n");

      return interaction.reply(
        `📋 **Whitelisted Channels**\n\n${text}`
      );
    }
  }
};
