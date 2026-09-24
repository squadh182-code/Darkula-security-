module.exports = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`⚙️ Command used: /${interaction.commandName}`);
};
