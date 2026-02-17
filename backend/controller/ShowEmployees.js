const path = require('path');
const EmployeeModel = require(path.join(__dirname, '..', 'models', 'employees'));

exports.DisplayEmployee = async (req, res) => {
    try {
        const employees = await EmployeeModel.find();
        // Return an empty list instead of 404 so the UI can render a valid empty state.
        res.json(employees);
    } catch (err) {
        console.error('Failed to fetch employees. Error:', err);
        res.status(500).send('Internal server error');
    }
};
