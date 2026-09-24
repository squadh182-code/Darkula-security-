const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../../data");
const dataFile = path.join(dataDir, "whitelist.json");

function ensureDatabase() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, {
      recursive: true
    });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(
      dataFile,
      JSON.stringify({
        users: [],
        roles: [],
        channels: []
      }, null, 2)
    );
  }
}

function load() {
  ensureDatabase();

  try {
    return JSON.parse(
      fs.readFileSync(dataFile, "utf8")
    );
  } catch {
    return {
      users: [],
      roles: [],
      channels: []
    };
  }
}

function save(data) {
  ensureDatabase();

  fs.writeFileSync(
    dataFile,
    JSON.stringify(data, null, 2)
  );
}

module.exports = {
  load,
  save
};
