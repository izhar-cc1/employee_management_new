const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema(
  {
    employeeId: { type: Number, required: true },
    employeeName: { type: String, required: true },
    leaveType: {
      type: String,
      enum: ["Annual", "Sick", "Casual", "Unpaid", "Other"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approverNote: { type: String, default: "" },
  },
  { timestamps: true },
);

const LeaveModel = mongoose.model("leaves", LeaveSchema);
module.exports = LeaveModel;
