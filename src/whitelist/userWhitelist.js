const users = new Map();

function add(userId, type = "All") {
  users.set(userId, type);
}

function remove(userId) {
  users.delete(userId);
}

function has(userId, type = "All") {
  if (!users.has(userId)) return false;

  const whitelistType = users.get(userId);

  return whitelistType === "All" || whitelistType === type;
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
