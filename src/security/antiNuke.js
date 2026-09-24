const securityLog = require("../utils/securityLog");

async function handleAction({
  guild,
  action,
  executor,
  reason
}) {
  if (!guild) return;

  console.log(
    `🛡️ Anti-Nuke: ${action}`
  );

  await securityLog(guild, {
    title: "Security Action",
    color: 0xFF0000,
    fields: [
      {
        name: "Action",
        value: action || "Unknown"
      },
      {
        name: "User",
        value: executor
          ? `${executor}`
          : "Unknown"
      },
      {
        name: "Reason",
        value: reason || "Security protection"
      }
    ]
  });
}

module.exports = {
  handleAction
};
