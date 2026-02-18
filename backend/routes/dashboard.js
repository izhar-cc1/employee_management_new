const express = require("express");
const router = express.Router();
const path = require("path");
const { getDashboard } = require(path.join(__dirname, "..", "controller", "DashboardController"));

router.route("/").get(getDashboard);

module.exports = router;
