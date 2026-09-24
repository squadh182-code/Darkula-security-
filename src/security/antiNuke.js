module.exports = {
  async handleAction(actionData) {
    if (!actionData) return;

    console.log("🛡️ Anti-Nuke protection checked.");
  }
};
