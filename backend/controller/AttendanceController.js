const path = require("path");
const AttendanceModel = require(path.join(__dirname, "..", "models", "attendance"));
const EmployeeModel = require(path.join(__dirname, "..", "models", "employees"));

const STATUSES = ["Present", "Absent", "Leave", "Half Day", "WFH"];

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

exports.createAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const parsedDate = parseDate(date);
    if (!parsedDate) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const employee = await EmployeeModel.findOne({ id: employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const attendance = await AttendanceModel.create({
      employeeId: employee.id,
      employeeName: `${employee.first_name} ${employee.last_name}`,
      date: parsedDate,
      status,
      checkIn: checkIn ?? "",
      checkOut: checkOut ?? "",
      notes: notes ?? "",
    });

    return res.status(201).json(attendance);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Attendance already exists for this employee and date" });
    }
    console.error("Failed to create attendance:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.listAttendance = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status && STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.employeeId) {
      const id = Number(req.query.employeeId);
      if (!Number.isNaN(id)) {
        filter.employeeId = id;
      }
    }

    if (req.query.date) {
      const day = parseDate(req.query.date);
      if (day) {
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        filter.date = { $gte: day, $lt: nextDay };
      }
    }

    const records = await AttendanceModel.find(filter).sort({ date: -1, createdAt: -1 });
    return res.json(records);
  } catch (err) {
    console.error("Failed to fetch attendance:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAttendanceById = async (req, res) => {
  try {
    const record = await AttendanceModel.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    return res.json(record);
  } catch (err) {
    console.error("Failed to fetch attendance record:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const record = await AttendanceModel.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    const { status, checkIn, checkOut, notes } = req.body;

    if (status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      record.status = status;
    }

    if (checkIn !== undefined) record.checkIn = checkIn;
    if (checkOut !== undefined) record.checkOut = checkOut;
    if (notes !== undefined) record.notes = notes;

    await record.save();
    return res.json(record);
  } catch (err) {
    console.error("Failed to update attendance:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const record = await AttendanceModel.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    return res.json({ message: "Attendance record deleted" });
  } catch (err) {
    console.error("Failed to delete attendance:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
