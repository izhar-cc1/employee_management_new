const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  leaderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "employees" },
  leaderName: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "employees" }],
  membersNames: [{ type: String }],
});

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "employees" },
    managerName: { type: String, required: true },
    manager: { type: String }, // legacy field for backward compatibility
    teams: [TeamSchema],
    description: { type: String, default: "" },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Ongoing", "Terminated", "Completed", "Yet to Start"],
      default: "Yet to Start",
    },
  },
  { timestamps: true },
);

const ProjectModel = mongoose.model("projects", ProjectSchema);

module.exports = ProjectModel;
