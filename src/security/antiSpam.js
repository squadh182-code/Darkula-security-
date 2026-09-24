module.exports = {
  async handleMessage(message) {
    if (!message || !message.guild) return;
    if (message.author?.bot) return;

    // Anti-spam system will be added here.
  }
};
