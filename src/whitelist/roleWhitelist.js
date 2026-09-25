const database =
  require("../database/database");


// ===============================
// ADD
// ===============================

async function add(
  roleId,
  type = "All"
) {
  roleId = String(roleId);
  type = String(type).trim();

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


// ===============================
// REMOVE
// ===============================

async function remove(
  roleId,
  type = "All"
) {
  roleId = String(roleId);
  type = String(type).trim();

  console.log(
    `🗑️ Removing role whitelist: ${roleId} | ${type}`
  );

  // Remove everything
  if (type === "All") {
    const removed =
      await database.removeAllWhitelist(
        roleId,
        "role"
      );

    console.log(
      `🗑️ Removed ${removed} whitelist row(s).`
    );

    return removed > 0;
  }

  // Remove specific type
  const removed =
    await database.removeWhitelist(
      roleId,
      "role",
      type
    );

  console.log(
    "🗑️ Removed whitelist row:",
    removed
  );

  return removed !== null;
}


// ===============================
// CHECK
// ===============================

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
        String(roleId),
        "role",
        type
      );

    if (exists) {
      return true;
    }
  }

  return false;
}


// ===============================
// LIST
// ===============================

async function list() {
  return database.listWhitelists(
    "role"
  );
}


// ===============================
// GET TYPES
// ===============================

async function getTypes(roleId) {
  return database.getWhitelists(
    String(roleId),
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
