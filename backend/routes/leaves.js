const express = require("express");
const router = express.Router();
const path = require("path");

const {
  createLeave,
  listLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave,
} = require(path.join(__dirname, "..", "controller", "LeaveController"));

router.route("/").get(listLeaves).post(createLeave);
router.route("/:id").get(getLeaveById).patch(updateLeave).delete(deleteLeave);

module.exports = router;
