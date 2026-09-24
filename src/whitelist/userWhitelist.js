const database =
  require("../database/database");

const data = database.load();

const users = new Map();

for (const item of data.users) {
  if (
    item &&
    item.id &&
    item.type
  ) {
    if (!users.has(item.id)) {
      users.set(item.id, new Set());
    }

    users.get(item.id).add(item.type);
  }
}

function save() {
  const current =
    database.load();

  current.users = [];

  for (const [id, types] of users.entries()) {
    for (const type of types) {
      current.users.push({
        id,
        type
      });
    }
  }

  database.save(current);
}

function add(
  userId,
  type = "All"
) {
  if (!users.has(userId)) {
    users.set(
      userId,
      new Set()
    );
  }

  const types =
    users.get(userId);

  // All replaces specific types
  if (type === "All") {
    types.clear();
    types.add("All");
  } else {
    // If All exists, specific type is unnecessary
    if (types.has("All")) {
      return;
    }

    types.add(type);
  }

  save();
}

function remove(
  userId,
  type = "All"
) {
  if (!users.has(userId)) {
    return false;
  }

  const types =
    users.get(userId);

  if (type === "All") {
    users.delete(userId);
    save();
    return true;
  }

  const removed =
    types.delete(type);

  if (types.size === 0) {
    users.delete(userId);
  }

  if (removed) {
    save();
  }

  return removed;
}

function has(
  userId,
  type = "All"
) {
  if (!users.has(userId)) {
    return false;
  }

  const types =
    users.get(userId);

  return (
    types.has("All") ||
    types.has(type)
  );
}

function list() {
  const result = [];

  for (const [id, types] of users.entries()) {
    result.push({
      id,
      types: [...types]
    });
  }

  return result;
}

function getTypes(userId) {
  if (!users.has(userId)) {
    return [];
  }

  return [
    ...users.get(userId)
  ];
}

module.exports = {
  add,
  remove,
  has,
  list,
  getTypes
};
