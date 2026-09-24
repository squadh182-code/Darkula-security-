module.exports = {
  handleMemberJoin(member) {
    if (!member.guild) return;

    console.log(
      `🛡️ Member joined: ${member.user.tag}`
    );

    // Anti-Raid protection will be added here.
  }
};
