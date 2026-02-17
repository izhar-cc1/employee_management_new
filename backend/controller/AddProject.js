const path = require("path");
const mongoose = require("mongoose");
const EmployeeModel = require(path.join(__dirname, "..", "models", "employees"));
const ProjectModel = require(path.join(__dirname, "..", "models", "project"));

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const validateTeams = (teams) => {
  if (!Array.isArray(teams) || teams.length === 0) return "Teams are required";
  for (const team of teams) {
    if (!team?.name) return "Team name is required";
    if (!team?.leaderId || !isValidObjectId(team.leaderId)) {
      return "Valid team leader is required";
    }
    if (!team?.leaderName) return "Team leader name is required";
    if (!Array.isArray(team?.members)) return "Team members must be an array";
    if (!Array.isArray(team?.membersNames)) return "Team member names must be an array";
    for (const memberId of team.members) {
      if (!isValidObjectId(memberId)) return "Invalid team member id";
    }
  }
  return null;
};

exports.createProject = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { name, managerId, managerName, teams, description, deadline } = req.body;

    if (!name || !managerId || !managerName || !deadline) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!isValidObjectId(managerId)) {
      return res.status(400).json({ message: "Invalid manager id" });
    }

    const teamError = validateTeams(teams);
    if (teamError) {
      return res.status(400).json({ message: teamError });
    }

    const manager = await EmployeeModel.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const createProjectWithSession = async (useSession) => {
      const createOptions = useSession ? { session } : undefined;
      const updateOptions = useSession ? { session } : undefined;

      const newProject = await ProjectModel.create(
        [
          {
            name,
            managerId,
            managerName,
            manager: managerName,
            teams,
            description,
            deadline,
          },
        ],
        createOptions,
      );

      const projectId = newProject[0]._id.toHexString();

      await EmployeeModel.updateOne(
        { _id: managerId },
        { $addToSet: { "projects.projectId": projectId } },
        updateOptions,
      );

      const updatePromises = teams.map((team) => {
        const leaderUpdate = EmployeeModel.updateOne(
          { _id: team.leaderId },
          { $addToSet: { "projects.projectId": projectId } },
          updateOptions,
        );

        const memberUpdates = team.members.map((memberId) =>
          EmployeeModel.updateOne(
            { _id: memberId },
            { $addToSet: { "projects.projectId": projectId } },
            updateOptions,
          ),
        );

        return Promise.all([leaderUpdate, ...memberUpdates]);
      });

      await Promise.all(updatePromises);
      return newProject[0];
    };

    try {
      await session.withTransaction(async () => {
        const project = await createProjectWithSession(true);
        res.status(201).json({ message: "Project created successfully", project });
      });
    } catch (err) {
      if (err && err.code === 20) {
        const project = await createProjectWithSession(false);
        return res
          .status(201)
          .json({ message: "Project created successfully", project });
      }
      throw err;
    }
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).json({ message: "Error adding project" });
  } finally {
    session.endSession();
  }
};
