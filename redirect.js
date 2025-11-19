const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/:code", async (req, res) => {
  const code = req.params.code;

  const row = await db.query("SELECT * FROM links WHERE code=$1", [code]);

  if (row.rowCount === 0 || row.rows[0].deleted)
    return res.status(404).send("Not found");

  const link = row.rows[0];

  await db.query(
    "UPDATE links SET clicks = clicks + 1, last_clicked = now() WHERE code=$1",
    [code]
  );

  res.redirect(302, link.target_url);
});

module.exports = router;
