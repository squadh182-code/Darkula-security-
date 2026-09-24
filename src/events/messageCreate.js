module.exports = async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  // Security message protection will be added here.
  // Anti-spam, mention spam, emoji spam,
  // long message and invite/link protection
  // will be connected in the next step.
};
