const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const catalogRoutes = require("./routes/catalogRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const metricsRoutes = require("./routes/metricsRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "cv-analyzer-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/analyses", analysisRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/metrics", metricsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
