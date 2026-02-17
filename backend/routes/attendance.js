const express = require("express");
const router = express.Router();
const path = require("path");

const {
  createAttendance,
  listAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
} = require(path.join(__dirname, "..", "controller", "AttendanceController"));

router.route("/").get(listAttendance).post(createAttendance);
router.route("/:id").get(getAttendanceById).patch(updateAttendance).delete(deleteAttendance);

module.exports = router;
