const database =
  require("../database/database");

async function add(
  channelId,
  type = "All"
) {
  channelId = String(channelId);
  type = String(type).trim();

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
  channelId = String(channelId);
  type = String(type).trim();

  console.log(
    `🗑️ Removing channel whitelist: ${channelId} | ${type}`
  );

  if (type === "All") {
    const removed =
      await database.removeAllWhitelist(
        channelId,
        "channel"
      );

    return removed > 0;
  }

  const removed =
    await database.removeWhitelist(
      channelId,
      "channel",
      type
    );

  return removed === true;
}

async function has(
  channelId,
  type = "All"
) {
  return database.hasWhitelist(
    String(channelId),
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
    String(channelId),
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
