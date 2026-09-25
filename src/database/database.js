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


// ==========================================
// DATABASE INIT
// ==========================================

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


// ==========================================
// ADD WHITELIST
// ==========================================

async function addWhitelist(
  targetId,
  targetType,
  whitelistType
) {
  targetId = String(targetId).trim();
  targetType = String(targetType).trim();
  whitelistType = String(whitelistType).trim();

  await pool.query(
    `
      INSERT INTO whitelists
      (
        target_id,
        target_type,
        whitelist_type
      )
      VALUES ($1, $2, $3)

      ON CONFLICT
      (
        target_id,
        target_type,
        whitelist_type
      )

      DO NOTHING;
    `,
    [
      targetId,
      targetType,
      whitelistType
    ]
  );

  console.log(
    `✅ Whitelist saved: ${targetId} | ${targetType} | ${whitelistType}`
  );
}


// ==========================================
// REMOVE ONE SPECIFIC TYPE
// ==========================================

async function removeWhitelist(
  targetId,
  targetType,
  whitelistType
) {
  targetId = String(targetId).trim();
  targetType = String(targetType).trim();
  whitelistType = String(whitelistType).trim();

  console.log(
    `🗑️ Removing whitelist:`
  );

  console.log(
    `   Target ID: ${targetId}`
  );

  console.log(
    `   Target Type: ${targetType}`
  );

  console.log(
    `   Whitelist Type: ${whitelistType}`
  );

  const result = await pool.query(
    `
      DELETE FROM whitelists

      WHERE TRIM(target_id) = TRIM($1)

        AND LOWER(TRIM(target_type))
            = LOWER(TRIM($2))

        AND LOWER(
              REPLACE(
                TRIM(whitelist_type),
                ' ',
                ''
              )
            )
            =
            LOWER(
              REPLACE(
                TRIM($3),
                ' ',
                ''
              )
            )

      RETURNING *;
    `,
    [
      targetId,
      targetType,
      whitelistType
    ]
  );


  if (result.rowCount > 0) {

    console.log(
      "✅ Whitelist successfully removed:"
    );

    console.log(
      result.rows[0]
    );

    return true;
  }


  console.log(
    "❌ No matching whitelist row found."
  );


  // DEBUG: Show what actually exists
  const check =
    await pool.query(
      `
        SELECT *
        FROM whitelists
        WHERE TRIM(target_id) = TRIM($1);
      `,
      [targetId]
    );


  console.log(
    "🔎 Existing rows for this target:",
    check.rows
  );


  return false;
}


// ==========================================
// REMOVE ALL TYPES
// ==========================================

async function removeAllWhitelist(
  targetId,
  targetType
) {
  targetId = String(targetId).trim();
  targetType = String(targetType).trim();

  const result = await pool.query(
    `
      DELETE FROM whitelists

      WHERE TRIM(target_id) = TRIM($1)

        AND LOWER(TRIM(target_type))
            = LOWER(TRIM($2))

      RETURNING *;
    `,
    [
      targetId,
      targetType
    ]
  );


  console.log(
    `🗑️ Removed ${result.rowCount} whitelist row(s).`
  );


  return result.rowCount;
}


// ==========================================
// GET TYPES
// ==========================================

async function getWhitelists(
  targetId,
  targetType
) {
  const result = await pool.query(
    `
      SELECT whitelist_type
      FROM whitelists

      WHERE TRIM(target_id) = TRIM($1)

        AND LOWER(TRIM(target_type))
            = LOWER(TRIM($2))

      ORDER BY whitelist_type;
    `,
    [
      String(targetId).trim(),
      String(targetType).trim()
    ]
  );


  return result.rows.map(
    row => row.whitelist_type
  );
}


// ==========================================
// CHECK WHITELIST
// ==========================================

async function hasWhitelist(
  targetId,
  targetType,
  whitelistType
) {
  const result = await pool.query(
    `
      SELECT 1
      FROM whitelists

      WHERE TRIM(target_id) = TRIM($1)

        AND LOWER(TRIM(target_type))
            = LOWER(TRIM($2))

        AND (
          LOWER(TRIM(whitelist_type)) = 'all'

          OR

          LOWER(
            REPLACE(
              TRIM(whitelist_type),
              ' ',
              ''
            )
          )
          =
          LOWER(
            REPLACE(
              TRIM($3),
              ' ',
              ''
            )
          )
        )

      LIMIT 1;
    `,
    [
      String(targetId).trim(),
      String(targetType).trim(),
      String(whitelistType).trim()
    ]
  );


  return result.rowCount > 0;
}


// ==========================================
// LIST
// ==========================================

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

      WHERE LOWER(TRIM(target_type))
            = LOWER(TRIM($1))

      ORDER BY
        target_id,
        whitelist_type;
    `,
    [
      String(targetType).trim()
    ]
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
