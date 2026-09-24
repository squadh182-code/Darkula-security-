module.exports = async (auditLogEntry, guild) => {
  console.log(
    `🔎 Audit Log: ${auditLogEntry.action} | Guild: ${guild.name}`
  );
};
