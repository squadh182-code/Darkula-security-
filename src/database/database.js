const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS whitelists (
      id SERIAL PRIMARY KEY,
      target_id VARCHAR(30) NOT NULL,
      target_type VARCHAR(20) NOT NULL,
      whitelist_type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      UNIQUE (
        target_id,
        target_type,
        whitelist_type
      )
    );
  `);

  console.log("✅ PostgreSQL database ready.");
}

async function addWhitelist(
  targetId,
  targetType,
  whitelistType
) {
  await pool.query(
    `
      INSERT INTO whitelists
        (target_id, target_type, whitelist_type)
      VALUES
        ($1, $2, $3)
      ON CONFLICT
        (target_id, target_type, whitelist_type)
      DO NOTHING;
    `,
    [
      targetId,
      targetType,
      whitelistType
    ]
  );
}

async function removeWhitelist(
  targetId,
  targetType,
  whitelistType
) {
  const result = await pool.query(
    `
      DELETE FROM whitelists
      WHERE target_id = $1
        AND target_type = $2
        AND whitelist_type = $3
      RETURNING *;
    `,
    [
      targetId,
      targetType,
      whitelistType
    ]
  );

  return result.rowCount > 0;
}

async function removeAllWhitelist(
  targetId,
  targetType
) {
  const result = await pool.query(
    `
      DELETE FROM whitelists
      WHERE target_id = $1
        AND target_type = $2
      RETURNING *;
    `,
    [
      targetId,
      targetType
    ]
  );

  return result.rowCount > 0;
}

async function getWhitelists(
  targetId,
  targetType
) {
  const result = await pool.query(
    `
      SELECT whitelist_type
      FROM whitelists
      WHERE target_id = $1
        AND target_type = $2
      ORDER BY whitelist_type;
    `,
    [
      targetId,
      targetType
    ]
  );

  return result.rows.map(
    row => row.whitelist_type
  );
}

async function hasWhitelist(
  targetId,
  targetType,
  whitelistType
) {
  const result = await pool.query(
    `
      SELECT 1
      FROM whitelists
      WHERE target_id = $1
        AND target_type = $2
        AND whitelist_type IN ('All', $3)
      LIMIT 1;
    `,
    [
      targetId,
      targetType,
      whitelistType
    ]
  );

  return result.rowCount > 0;
}

async function listWhitelists(
  targetType
) {
  const result = await pool.query(
    `
      SELECT
        target_id,
        target_type,
        whitelist_type
      FROM whitelists
      WHERE target_type = $1
      ORDER BY target_id, whitelist_type;
    `,
    [targetType]
  );

  return result.rows;
}

module.exports = {
  pool,
  initDatabase,
  addWhitelist,
  removeWhitelist,
  removeAllWhitelist,
  getWhitelists,
  hasWhitelist,
  listWhitelists
};
