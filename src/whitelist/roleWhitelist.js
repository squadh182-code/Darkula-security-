const database = require("../database/database");

const data = database.load();

const roles = new Map(
  data.roles.map(item => [
    item.id,
    item.type
  ])
);

function save() {
  const current = database.load();

  current.roles = [...roles.entries()]
    .map(([id, type]) => ({
      id,
      type
    }));

  database.save(current);
}

function add(roleId, type = "All") {
  roles.set(roleId, type);
  save();
}

function remove(roleId) {
  roles.delete(roleId);
  save();
}

function has(roleIds, type = "All") {
  if (!Array.isArray(roleIds)) {
    roleIds = [roleIds];
  }

  return roleIds.some(roleId => {
    if (!roles.has(roleId)) {
      return false;
    }

    const whitelistType = roles.get(roleId);

    return (
      whitelistType === "All" ||
      whitelistType === type
    );
  });
}

function list() {
  return [...roles.entries()];
}

module.exports = {
  add,
  remove,
  has,
  list
};
