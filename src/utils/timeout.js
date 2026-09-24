async function timeoutMember(member, duration, reason) {
  if (!member) return false;

  if (!member.moderatable) {
    console.log(
      `❌ Cannot timeout ${member.user?.tag || member.id}`
    );

    return false;
  }

  try {
    await member.timeout(duration, reason);

    return true;
  } catch (error) {
    console.error("❌ Timeout failed:", error);
    return false;
  }
}

module.exports = {
  timeoutMember
};
