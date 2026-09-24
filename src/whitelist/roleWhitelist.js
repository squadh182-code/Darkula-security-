const database =
  require("../database/database");

const data = database.load();

const roles = new Map();

for (const item of data.roles) {
  if (
    item &&
    item.id &&
    item.type
  ) {
    if (!roles.has(item.id)) {
      roles.set(
        item.id,
        new Set()
      );
    }

    roles.get(item.id).add(item.type);
  }
}

function save() {
  const current =
    database.load();

  current.roles = [];

  for (const [id, types] of roles.entries()) {
    for (const type of types) {
      current.roles.push({
        id,
        type
      });
    }
  }

  database.save(current);
}

function add(
  roleId,
  type = "All"
) {
  if (!roles.has(roleId)) {
    roles.set(
      roleId,
      new Set()
    );
  }

  const types =
    roles.get(roleId);

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
  roleId,
  type = "All"
) {
  if (!roles.has(roleId)) {
    return false;
  }

  const types =
    roles.get(roleId);

  if (type === "All") {
    roles.delete(roleId);
    save();
    return true;
  }

  const removed =
    types.delete(type);

  if (types.size === 0) {
    roles.delete(roleId);
  }

  if (removed) {
    save();
  }

  return removed;
}

function has(
  roleIds,
  type = "All"
) {
  if (!Array.isArray(roleIds)) {
    roleIds = [roleIds];
  }

  return roleIds.some(roleId => {
    if (!roles.has(roleId)) {
      return false;
    }

    const types =
      roles.get(roleId);

    return (
      types.has("All") ||
      types.has(type)
    );
  });
}

function list() {
  const result = [];

  for (const [id, types] of roles.entries()) {
    result.push({
      id,
      types: [...types]
    });
  }

  return result;
}

function getTypes(roleId) {
  if (!roles.has(roleId)) {
    return [];
  }

  return [
    ...roles.get(roleId)
  ];
}

module.exports = {
  add,
  remove,
  has,
  list,
  getTypes
};
