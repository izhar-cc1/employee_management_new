const path = require("path");
const EmployeeModel = require(path.join(__dirname, "..", "models", "employees"));

exports.getMe = async (req, res) => {
  try {
    const user = await EmployeeModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const derivedRole =
      user.access_role ||
      (user.email === "admin@gmail.com"
        ? "Admin"
        : user.current_role === "Manager"
          ? "Manager"
          : "Employee");

    return res.json({
      id: user._id,
      employeeId: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: derivedRole,
      current_role: user.current_role,
      department: user.department,
      photo: user.photo || "",
    });
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
