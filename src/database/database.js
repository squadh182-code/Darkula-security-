const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../../data");
const dataFile = path.join(dataDir, "whitelist.json");

const defaultData = {
  users: [],
  roles: [],
  channels: []
};

function ensureDatabase() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, {
      recursive: true
    });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(
      dataFile,
      JSON.stringify(defaultData, null, 2)
    );
  }
}

function load() {
  ensureDatabase();

  try {
    const data = JSON.parse(
      fs.readFileSync(dataFile, "utf8")
    );

    return {
      users: Array.isArray(data.users)
        ? data.users
        : [],

      roles: Array.isArray(data.roles)
        ? data.roles
        : [],

      channels: Array.isArray(data.channels)
        ? data.channels
        : []
    };
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
