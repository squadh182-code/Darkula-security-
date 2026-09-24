const {
  joinVoiceChannel,
  getVoiceConnection
} = require("@discordjs/voice");

function joinChannel(channel) {
  if (!channel || !channel.isVoiceBased()) {
    throw new Error("Invalid voice channel.");
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: true
  });

  return connection;
}

function leaveChannel(guildId) {
  const connection = getVoiceConnection(guildId);

  if (!connection) {
    return false;
  }

  connection.destroy();
  return true;
}

module.exports = {
  joinChannel,
  leaveChannel
};
