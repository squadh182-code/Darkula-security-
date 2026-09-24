const database =
  require("../database/database");

const data = database.load();

const channels = new Map();

for (const item of data.channels) {
  if (
    item &&
    item.id &&
    item.type
  ) {
    if (!channels.has(item.id)) {
      channels.set(
        item.id,
        new Set()
      );
    }

    channels
      .get(item.id)
      .add(item.type);
  }
}

function save() {
  const current =
    database.load();

  current.channels = [];

  for (const [id, types] of channels.entries()) {
    for (const type of types) {
      current.channels.push({
        id,
        type
      });
    }
  }

  database.save(current);
}

function add(
  channelId,
  type = "All"
) {
  if (!channels.has(channelId)) {
    channels.set(
      channelId,
      new Set()
    );
  }

  const types =
    channels.get(channelId);

  if (type === "All") {
    types.clear();
    types.add("All");
  } else {
    if (types.has("All")) {
      return;
    }

    types.add(type);
  }

  save();
}

function remove(
  channelId,
  type = "All"
) {
  if (!channels.has(channelId)) {
    return false;
  }

  const types =
    channels.get(channelId);

  if (type === "All") {
    channels.delete(channelId);
    save();
    return true;
  }

  const removed =
    types.delete(type);

  if (types.size === 0) {
    channels.delete(channelId);
  }

  if (removed) {
    save();
  }

  return removed;
}

function has(
  channelId,
  type = "All"
) {
  if (!channels.has(channelId)) {
    return false;
  }

  const types =
    channels.get(channelId);

  return (
    types.has("All") ||
    types.has(type)
  );
}

function list() {
  const result = [];

  for (const [id, types] of channels.entries()) {
    result.push({
      id,
      types: [...types]
    });
  }

  return result;
}

function getTypes(channelId) {
  if (!channels.has(channelId)) {
    return [];
  }

  return [
    ...channels.get(channelId)
  ];
}

module.exports = {
  add,
  remove,
  has,
  list,
  getTypes
};
