const express = require("express");
const router = express.Router();
const path = require("path");
const { getMe } = require(path.join(__dirname, "..", "controller", "MeController"));

router.route("/").get(getMe);

module.exports = router;
