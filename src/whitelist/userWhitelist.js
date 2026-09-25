const database =
  require("../database/database");

async function add(
  userId,
  type = "All"
) {
  userId = String(userId);
  type = String(type).trim();

  if (type === "All") {
    await database.removeAllWhitelist(
      userId,
      "user"
    );
  }

  await database.addWhitelist(
    userId,
    "user",
    type
  );
}


async function remove(
  userId,
  type = "All"
) {
  userId = String(userId);
  type = String(type).trim();

  console.log(
    `🗑️ Removing user whitelist: ${userId} | ${type}`
  );

  if (type === "All") {
    const removed =
      await database.removeAllWhitelist(
        userId,
        "user"
      );

    return removed > 0;
  }

  const removed =
    await database.removeWhitelist(
      userId,
      "user",
      type
    );

  console.log(
    "🗑️ Removed user whitelist:",
    removed
  );

  return removed !== null;
}


async function has(
  userId,
  type = "All"
) {
  return database.hasWhitelist(
    String(userId),
    "user",
    type
  );
}


async function list() {
  return database.listWhitelists(
    "user"
  );
}


async function getTypes(userId) {
  return database.getWhitelists(
    String(userId),
    "user"
  );
}


module.exports = {
  add,
  remove,
  has,
  list,
  getTypes
};
