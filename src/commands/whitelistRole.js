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

    .setDescription(
      "Manage role whitelist"
    )


    // ===============================
    // ADD
    // ===============================

    .addSubcommand(sub =>
      sub
        .setName("add")
        .setDescription(
          "Add a role to the whitelist"
        )

        .addRoleOption(option =>
          option
            .setName("role")
            .setDescription(
              "Role to whitelist"
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


    // ===============================
    // REMOVE
    // ===============================

    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription(
          "Remove a role from the whitelist"
        )

        .addRoleOption(option =>
          option
            .setName("role")
            .setDescription(
              "Role to remove"
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


    // ===============================
    // LIST
    // ===============================

    .addSubcommand(sub =>
      sub
        .setName("list")
        .setDescription(
          "List whitelisted roles"
        )
    ),


  async execute(interaction) {

    const subcommand =
      interaction.options.getSubcommand();


    // ===============================
    // ADD
    // ===============================

    if (subcommand === "add") {

      const role =
        interaction.options.getRole(
          "role"
        );

      const type =
        interaction.options.getString(
          "type"
        );


      await roleWhitelist.add(
        role.id,
        type
      );


      return interaction.reply(
        `✅ ${role} has been whitelisted for **${type}**.`
      );
    }


    // ===============================
    // REMOVE
    // ===============================

    if (subcommand === "remove") {

      const role =
        interaction.options.getRole(
          "role"
        );

      const type =
        interaction.options.getString(
          "type"
        );


      const removed =
        await roleWhitelist.remove(
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


    // ===============================
    // LIST
    // ===============================

    if (subcommand === "list") {

      const rows =
        await roleWhitelist.list();


      if (!rows.length) {

        return interaction.reply(
          "📋 No roles are currently whitelisted."
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
          .push(
            row.whitelist_type
          );
      }


      const text =
        [...grouped.entries()]
          .map(
            ([id, types]) =>
              `<@&${id}> — ${types.join(", ")}`
          )
          .join("\n");


      return interaction.reply(
        `📋 **Whitelisted Roles**\n\n${text}`
      );
    }
  }
};
