const path = require("path");
const EmployeeModel = require(path.join(__dirname, "..", "models", "employees"));
const LeaveModel = require(path.join(__dirname, "..", "models", "leave"));
const AttendanceModel = require(path.join(__dirname, "..", "models", "attendance"));
const ProjectModel = require(path.join(__dirname, "..", "models", "project"));

const getDayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

exports.getDashboard = async (req, res) => {
  try {
    const role = req.user?.role || "Employee";
    const { start, end } = getDayRange();

    if (role === "Admin" || role === "Manager") {
      const [totalEmployees, activeEmployees, totalProjects, pendingLeaves] =
        await Promise.all([
          EmployeeModel.countDocuments(),
          EmployeeModel.countDocuments({ status: "Active" }),
          ProjectModel.countDocuments(),
          LeaveModel.countDocuments({ status: "Pending" }),
        ]);

      const presentToday = await AttendanceModel.countDocuments({
        date: { $gte: start, $lte: end },
        status: { $in: ["Present", "WFH", "Half Day"] },
      });

      const onLeaveToday = await LeaveModel.countDocuments({
        status: "Approved",
        startDate: { $lte: end },
        endDate: { $gte: start },
      });

      const absentToday = Math.max(
        activeEmployees - presentToday - onLeaveToday,
        0,
      );

      return res.json({
        role,
        summary: {
          totalEmployees,
          activeEmployees,
          totalProjects,
          presentToday,
          onLeaveToday,
          absentToday,
          pendingLeaves,
        },
      });
    }

    const employeeId = req.user?.employeeId;
    const employee = await EmployeeModel.findById(req.user.id);

    const todayAttendance = await AttendanceModel.findOne({
      employeeId,
      date: { $gte: start, $lte: end },
    });

    const upcomingLeaves = await LeaveModel.find({
      employeeId,
      status: "Approved",
      startDate: { $gte: start },
    })
      .sort({ startDate: 1 })
      .limit(3);

    const pendingLeaveCount = await LeaveModel.countDocuments({
      employeeId,
      status: "Pending",
    });

    return res.json({
      role,
      profile: {
        name: employee ? `${employee.first_name} ${employee.last_name}` : "",
        department: employee?.department,
        current_role: employee?.current_role,
        photo: employee?.photo || "",
      },
      todayAttendance,
      upcomingLeaves,
      pendingLeaveCount,
    });
  } catch (err) {
    console.error("Failed to build dashboard:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
