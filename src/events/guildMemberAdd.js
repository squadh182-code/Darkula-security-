module.exports = async (member) => {
  if (!member.user.bot) return;

  console.log(`🤖 Bot joined: ${member.user.tag}`);

  const botRoleId = "1401958482264985621";
  const role = member.guild.roles.cache.get(botRoleId);

  if (!role) {
    console.log("❌ Bot role not found.");
    return;
  }

  if (!role.editable) {
    console.log("❌ I cannot assign the bot role. Check role hierarchy.");
    return;
  }

  try {
    await member.roles.add(role);
    console.log(`✅ Bot role assigned to ${member.user.tag}`);
  } catch (error) {
    console.error("❌ Failed to assign bot role:", error);
  }
};
