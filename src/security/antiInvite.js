module.exports = {
  async handleMessage(message) {
    if (!message || !message.guild) return;
    if (message.author?.bot) return;

    // Invite and link protection will be added here.
  }
};
