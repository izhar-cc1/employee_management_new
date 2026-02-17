const express = require("express");
const router = express.Router();
const path = require("path");

const { createProject } = require(path.join(__dirname, "..", "controller", "AddProject"));
const { DisplayProject } = require(path.join(__dirname, "..", "controller", "ShowProjects"));
const { ProjectGetbyid } = require(path.join(__dirname, "..", "controller", "ProjectID"));
const { editProject } = require(path.join(__dirname, "..", "controller", "EditProject"));

router.route("/").get(DisplayProject).post(createProject);
router.route("/:projectId").get(ProjectGetbyid).put(editProject);

module.exports = router;
