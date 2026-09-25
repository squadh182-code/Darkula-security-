const database =
  require("../database/database");

async function add(
  channelId,
  type = "All"
) {
  if (type === "All") {
    await database.removeAllWhitelist(
      channelId,
      "channel"
    );
  }

  await database.addWhitelist(
    channelId,
    "channel",
    type
  );
}

async function remove(
  channelId,
  type = "All"
) {
  if (type === "All") {
    return database.removeAllWhitelist(
      channelId,
      "channel"
    );
  }

  return database.removeWhitelist(
    channelId,
    "channel",
    type
  );
}

async function has(
  channelId,
  type = "All"
) {
  return database.hasWhitelist(
    channelId,
    "channel",
    type
  );
}

async function list() {
  return database.listWhitelists(
    "channel"
  );
}

async function getTypes(channelId) {
  return database.getWhitelists(
    channelId,
    "channel"
  );
}

module.exports = {
  add,
  remove,
  has,
  list,
  getTypes
};
