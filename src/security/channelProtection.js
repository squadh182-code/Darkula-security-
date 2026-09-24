const securityLog = require("../utils/securityLog");

async function handleChannelAction({
  guild,
  action,
  channel,
  executor
}) {
  if (!guild) return;

  console.log(
    `🛡️ Channel Protection: ${action}`
  );

  await securityLog(guild, {
    title: `Channel ${action}`,
    color: 0xFF0000,
    fields: [
      {
        name: "Channel",
        value: channel
          ? `${channel.name || channel.id}`
          : "Unknown"
      },
      {
        name: "User",
        value: executor
          ? `${executor}`
          : "Unknown"
      }
    ]
  });
}

module.exports = {
  handleChannelAction
};
