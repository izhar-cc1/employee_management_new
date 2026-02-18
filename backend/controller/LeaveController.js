const path = require("path");
const LeaveModel = require(path.join(__dirname, "..", "models", "leave"));
const EmployeeModel = require(path.join(__dirname, "..", "models", "employees"));

const LEAVE_TYPES = ["Annual", "Sick", "Casual", "Unpaid", "Other"];
const LEAVE_STATUSES = ["Pending", "Approved", "Rejected"];

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

exports.createLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    if (!employeeId || !leaveType || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!LEAVE_TYPES.includes(leaveType)) {
      return res.status(400).json({ message: "Invalid leave type" });
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) {
      return res.status(400).json({ message: "Invalid date range" });
    }
    if (start > end) {
      return res.status(400).json({ message: "Start date must be before end date" });
    }

    const employee = await EmployeeModel.findOne({ id: employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const leave = await LeaveModel.create({
      employeeId: employee.id,
      employeeName: `${employee.first_name} ${employee.last_name}`,
      leaveType,
      startDate: start,
      endDate: end,
      reason: reason ?? "",
    });

    return res.status(201).json(leave);
  } catch (err) {
    console.error("Failed to create leave:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.listLeaves = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status && LEAVE_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.employeeId) {
      const id = Number(req.query.employeeId);
      if (!Number.isNaN(id)) {
        filter.employeeId = id;
      }
    }

    if (req.query.from || req.query.to) {
      const from = parseDate(req.query.from);
      const to = parseDate(req.query.to);
      filter.startDate = {};
      if (from) filter.startDate.$gte = from;
      if (to) filter.startDate.$lte = to;
    }

    const leaves = await LeaveModel.find(filter).sort({ createdAt: -1 });
    return res.json(leaves);
  } catch (err) {
    console.error("Failed to fetch leaves:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLeaveById = async (req, res) => {
  try {
    const leave = await LeaveModel.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    return res.json(leave);
  } catch (err) {
    console.error("Failed to fetch leave:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateLeave = async (req, res) => {
  try {
    const leave = await LeaveModel.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const { leaveType, startDate, endDate, reason, status, approverNote } =
      req.body;

    if (status) {
      const role = req.user?.role || "Employee";
      if (!["Admin", "Manager"].includes(role)) {
        return res.status(403).json({ message: "Only admin or manager can approve or reject leave" });
      }
    }

    if (leaveType) {
      if (!LEAVE_TYPES.includes(leaveType)) {
        return res.status(400).json({ message: "Invalid leave type" });
      }
      leave.leaveType = leaveType;
    }

    if (startDate) {
      const start = parseDate(startDate);
      if (!start) {
        return res.status(400).json({ message: "Invalid start date" });
      }
      leave.startDate = start;
    }

    if (endDate) {
      const end = parseDate(endDate);
      if (!end) {
        return res.status(400).json({ message: "Invalid end date" });
      }
      leave.endDate = end;
    }

    if (leave.startDate > leave.endDate) {
      return res.status(400).json({ message: "Start date must be before end date" });
    }

    if (reason !== undefined) {
      leave.reason = reason;
    }

    if (status) {
      if (!LEAVE_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      leave.status = status;
    }

    if (approverNote !== undefined) {
      leave.approverNote = approverNote;
    }

    await leave.save();
    return res.json(leave);
  } catch (err) {
    console.error("Failed to update leave:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    const leave = await LeaveModel.findByIdAndDelete(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    return res.json({ message: "Leave request deleted" });
  } catch (err) {
    console.error("Failed to delete leave:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
