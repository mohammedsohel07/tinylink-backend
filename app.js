require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const apiRouter = require("./routes/api");
const redirectRouter = require("./routes/redirect");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Health Check
app.get("/healthz", (req, res) => {
  res.json({ ok: true, version: "1.0" });
});

// API Routes
app.use("/api", apiRouter);

// Redirect Route
app.use("/:code", redirectRouter);

// Fallback 404
app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
