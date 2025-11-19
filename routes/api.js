const express = require("express");
const router = express.Router();

const {
  createLink,
  listLinks,
  getLink,
  deleteLink,
} = require("../controllers/links.controller");

// Get all links
router.get("/links", async (req, res) => {
  const links = await listLinks();
  res.json(links);
});

// Get stats for a specific code
router.get("/links/:code", async (req, res) => {
  const link = await getLink(req.params.code);
  if (!link) return res.status(404).json({ error: "Not found" });
  res.json(link);
});

// Create a new short link
router.post("/links", async (req, res) => {
  try {
    const { url, code } = req.body;
    const link = await createLink(url, code);
    res.status(201).json(link);
  } catch (err) {
    if (err.code === "CONFLICT")
      return res.status(409).json({ error: "Code already exists" });
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a short link
router.delete("/links/:code", async (req, res) => {
  const deleted = await deleteLink(req.params.code);
  res.json({ success: deleted });
});

module.exports = router;
