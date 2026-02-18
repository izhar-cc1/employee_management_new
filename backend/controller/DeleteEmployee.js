const path = require('path');
const EmployeeModel = require(path.join(__dirname, '..', 'models', 'employees'));

exports.DeleteEmployee = async (req, res) => {
    try {
        const id = req.params.employeeId;
        const employee = await EmployeeModel.findOneAndDelete({ id });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        return res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        console.error('Error deleting employee:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
