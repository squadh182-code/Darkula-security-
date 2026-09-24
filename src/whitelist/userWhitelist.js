const database = require("../database/database");

const data = database.load();

const users = new Map(
  data.users.map(item => [
    item.id,
    item.type
  ])
);

function save() {
  const current = database.load();

  current.users = [...users.entries()]
    .map(([id, type]) => ({
      id,
      type
    }));

  database.save(current);
}

function add(userId, type = "All") {
  users.set(userId, type);
  save();
}

function remove(userId) {
  users.delete(userId);
  save();
}

function has(userId, type = "All") {
  if (!users.has(userId)) {
    return false;
  }

  const whitelistType = users.get(userId);

  return (
    whitelistType === "All" ||
    whitelistType === type
  );
}

function list() {
  return [...users.entries()];
}

module.exports = {
  add,
  remove,
  has,
  list
};
