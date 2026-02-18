const express = require('express');
const router = express.Router();
const path = require('path');
const { DeleteEmployee } = require(path.join(__dirname, '..', 'controller', 'DeleteEmployee'));

router.route('/id/:employeeId').delete(DeleteEmployee);

module.exports = router;
