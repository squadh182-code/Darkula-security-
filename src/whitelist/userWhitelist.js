const database =
  require("../database/database");

async function add(
  userId,
  type = "All"
) {
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
  if (type === "All") {
    return database.removeAllWhitelist(
      userId,
      "user"
    );
  }

  return database.removeWhitelist(
    userId,
    "user",
    type
  );
}

async function has(
  userId,
  type = "All"
) {
  return database.hasWhitelist(
    userId,
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
    userId,
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
