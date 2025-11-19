const db = require("../db");
const shortid = require("shortid");

// Generate 6-character alphanumeric code
function generateCode() {
  return shortid
    .generate()
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 6);
}

async function createLink(url, code) {
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    let finalCode = code;

    if (!finalCode) {
      let unique = false;
      while (!unique) {
        finalCode = generateCode();
        const check = await client.query("SELECT 1 FROM links WHERE code=$1", [
          finalCode,
        ]);
        if (check.rowCount === 0) unique = true;
      }
    } else {
      const check = await client.query("SELECT 1 FROM links WHERE code=$1", [
        finalCode,
      ]);
      if (check.rowCount > 0) {
        const err = new Error("Code already exists");
        err.code = "CONFLICT";
        throw err;
      }
    }

    const insert = `
      INSERT INTO links (code, target_url, clicks, created_at, last_clicked, deleted)
      VALUES ($1, $2, 0, now(), NULL, false)
      RETURNING code, target_url, clicks, created_at, last_clicked
    `;

    const result = await client.query(insert, [finalCode, url]);

    await client.query("COMMIT");

    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function listLinks() {
  const res = await db.query(`
    SELECT code, target_url, clicks, last_clicked, created_at
    FROM links
    WHERE deleted = false
    ORDER BY created_at DESC
  `);

  return res.rows;
}

async function getLink(code) {
  const res = await db.query(
    `
    SELECT code, target_url, clicks, last_clicked, created_at
    FROM links
    WHERE code = $1 AND deleted = false
    `,
    [code]
  );

  return res.rowCount ? res.rows[0] : null;
}

async function deleteLink(code) {
  const res = await db.query(
    `
    UPDATE links
    SET deleted = true
    WHERE code = $1 AND deleted = false
    RETURNING code
    `,
    [code]
  );

  return res.rowCount > 0;
}

module.exports = { createLink, listLinks, getLink, deleteLink };
