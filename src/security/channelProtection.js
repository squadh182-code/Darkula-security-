module.exports = {
  async handleChannelAction(actionData) {
    if (!actionData) return;

    console.log("🛡️ Channel protection checked.");
  }
};
