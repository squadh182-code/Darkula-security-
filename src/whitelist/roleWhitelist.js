const database =
  require("../database/database");

async function add(
  roleId,
  type = "All"
) {
  if (type === "All") {
    await database.removeAllWhitelist(
      roleId,
      "role"
    );
  }

  await database.addWhitelist(
    roleId,
    "role",
    type
  );
}

async function remove(
  roleId,
  type = "All"
) {
  if (type === "All") {
    return database.removeAllWhitelist(
      roleId,
      "role"
    );
  }

  return database.removeWhitelist(
    roleId,
    "role",
    type
  );
}

async function has(
  roleIds,
  type = "All"
) {
  if (!Array.isArray(roleIds)) {
    roleIds = [roleIds];
  }

  for (const roleId of roleIds) {
    const exists =
      await database.hasWhitelist(
        roleId,
        "role",
        type
      );

    if (exists) {
      return true;
    }
  }

  return false;
}

async function list() {
  return database.listWhitelists(
    "role"
  );
}

async function getTypes(roleId) {
  return database.getWhitelists(
    roleId,
    "role"
  );
}

module.exports = {
  add,
  remove,
  has,
  list,
  getTypes
};
