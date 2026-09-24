module.exports = {
  async handleRoleAction(actionData) {
    if (!actionData) return;

    console.log("🛡️ Role protection checked.");
  }
};
