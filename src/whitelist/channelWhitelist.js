const channels = new Map();

function add(channelId, type = "All") {
  channels.set(channelId, type);
}

function remove(channelId) {
  channels.delete(channelId);
}

function has(channelId, type = "All") {
  if (!channels.has(channelId)) return false;

  const whitelistType = channels.get(channelId);

  return whitelistType === "All" || whitelistType === type;
}

function list() {
  return [...channels.entries()];
}

module.exports = {
  add,
  remove,
  has,
  list
};
