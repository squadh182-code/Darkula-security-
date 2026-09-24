const cooldowns = new Map();

function isOnCooldown(key, duration) {
  const now = Date.now();
  const lastUsed = cooldowns.get(key);

  if (lastUsed && now - lastUsed < duration) {
    return true;
  }

  cooldowns.set(key, now);
  return false;
}

function clearCooldown(key) {
  cooldowns.delete(key);
}

module.exports = {
  isOnCooldown,
  clearCooldown
};
