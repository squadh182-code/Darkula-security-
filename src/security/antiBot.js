module.exports = {
  async handleBotAdd(member) {
    if (!member || !member.guild) return;
    if (!member.user.bot) return;

    console.log(`🤖 Bot detected: ${member.user.tag}`);

    // Bot protection will be added here.
  }
};
