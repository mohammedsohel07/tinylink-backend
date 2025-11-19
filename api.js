const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const controller = require("../controllers/links.controller");

// Create link
router.post(
  "/links",
  body("url").isURL({ require_protocol: true }),
  body("code").optional().isAlphanumeric().isLength({ min: 6, max: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { url, code } = req.body;
      const link = await controller.createLink(url, code);
      res.status(201).json(link);
    } catch (err) {
      if (err.code === "CONFLICT")
        return res.status(409).json({ error: err.message });
      res.status(500).json({ error: "Server error" });
    }
  }
);

// List links
router.get("/links", async (req, res) => {
  const data = await controller.listLinks();
  res.json(data);
});

// Stats
router.get("/links/:code", async (req, res) => {
  const data = await controller.getLink(req.params.code);
  if (!data) return res.status(404).json({ error: "Not found" });
  res.json(data);
});

// Delete
router.delete("/links/:code", async (req, res) => {
  const ok = await controller.deleteLink(req.params.code);
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

module.exports = router;
