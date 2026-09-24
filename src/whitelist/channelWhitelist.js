const database = require("../database/database");

const data = database.load();

const channels = new Map(
  data.channels.map(item => [
    item.id,
    item.type
  ])
);

function save() {
  const current = database.load();

  current.channels = [...channels.entries()]
    .map(([id, type]) => ({
      id,
      type
    }));

  database.save(current);
}

function add(channelId, type = "All") {
  channels.set(channelId, type);
  save();
}

function remove(channelId) {
  channels.delete(channelId);
  save();
}

function has(channelId, type = "All") {
  if (!channels.has(channelId)) {
    return false;
  }

  const whitelistType = channels.get(channelId);

  return (
    whitelistType === "All" ||
    whitelistType === type
  );
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
