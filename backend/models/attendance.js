const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: Number, required: true },
    employeeName: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Present", "Absent", "Leave", "Half Day", "WFH"],
      required: true,
    },
    checkIn: { type: String, default: "" },
    checkOut: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const AttendanceModel = mongoose.model("attendance", AttendanceSchema);
module.exports = AttendanceModel;
