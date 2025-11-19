const express = require("express");
const router = express.Router();
const db = require("../db");

// Handle redirect
router.get("/:code", async (req, res) => {
  const code = req.params.code;

  const result = await db.query(
    "SELECT target_url FROM links WHERE code=$1 AND deleted=false",
    [code]
  );

  if (result.rowCount === 0) {
    return res.status(404).send("Not Found");
  }

  // Update click count and timestamp
  await db.query(
    "UPDATE links SET clicks = clicks + 1, last_clicked = now() WHERE code=$1",
    [code]
  );

  res.redirect(result.rows[0].target_url);
});

module.exports = router;

