const commands = new Map();

const whitelist =
  require("../commands/whitelist");

const whitelistRole =
  require("../commands/whitelistRole");

const whitelistChannel =
  require("../commands/whitelistChannel");

const join =
  require("../commands/join");

const leave =
  require("../commands/leave");


/*
 * Register Commands
 */

commands.set(
  whitelist.data.name,
  whitelist
);

commands.set(
  whitelistRole.data.name,
  whitelistRole
);

commands.set(
  whitelistChannel.data.name,
  whitelistChannel
);

commands.set(
  join.data.name,
  join
);

commands.set(
  leave.data.name,
  leave
);


/*
 * Interaction Handler
 */

module.exports = async (interaction) => {

  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command =
    commands.get(
      interaction.commandName
    );

  if (!command) {
    return;
  }

  try {

    await command.execute(
      interaction
    );

  } catch (error) {

    console.error(
      "❌ Command error:",
      error
    );

    if (interaction.replied) {

      await interaction.followUp({
        content:
          "❌ Something went wrong.",
        ephemeral: true
      }).catch(() => {});

    } else {

      await interaction.reply({
        content:
          "❌ Something went wrong.",
        ephemeral: true
      }).catch(() => {});

    }
  }
};


/*
 * Export Commands
 */

module.exports.commands =
  commands;
