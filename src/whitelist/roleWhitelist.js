const roles = new Map();

function add(roleId, type = "All") {
  roles.set(roleId, type);
}

function remove(roleId) {
  roles.delete(roleId);
}

function has(roleIds, type = "All") {
  if (!Array.isArray(roleIds)) {
    roleIds = [roleIds];
  }

  return roleIds.some((roleId) => {
    if (!roles.has(roleId)) return false;

    const whitelistType = roles.get(roleId);

    return whitelistType === "All" || whitelistType === type;
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
