import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from './api/client.js';
import { useAuth } from './hooks/useAuth.js';

const leaveTypes = ['Annual', 'Sick', 'Casual', 'Unpaid', 'Other'];
const statusFilters = ['All', 'Pending', 'Approved', 'Rejected'];

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
};

const calcDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '-';
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
};

export default function LeaveManagement() {
  useAuth();
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'Employee';
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [formError, setFormError] = useState('');
  const [formState, setFormState] = useState({
    employeeId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
      })),
    [employees],
  );

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/');
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchLeaves = async (filter = statusFilter) => {
    try {
      const params = {};
      if (filter && filter !== 'All') {
        params.status = filter;
      }
      const response = await api.get('/leaves', { params });
      setLeaves(response.data || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchLeaves('All');
  }, []);

  useEffect(() => {
    fetchLeaves(statusFilter);
  }, [statusFilter]);

  const handleFormChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetForm = () => {
    setFormState({ employeeId: '', leaveType: '', startDate: '', endDate: '', reason: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const { employeeId, leaveType, startDate, endDate, reason } = formState;
    if (!employeeId || !leaveType || !startDate || !endDate) {
      setFormError('Please fill all required fields.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setFormError('Start date must be before end date.');
      return;
    }

    try {
      await api.post('/leaves', {
        employeeId: Number(employeeId),
        leaveType,
        startDate,
        endDate,
        reason,
      });
      resetForm();
      fetchLeaves(statusFilter);
    } catch (error) {
      console.error('Error creating leave:', error);
      setFormError('Failed to create leave.');
    }
  };

  const handleStatusUpdate = async (leaveId, status) => {
    try {
      await api.patch(`/leaves/${leaveId}`, { status });
      fetchLeaves(statusFilter);
    } catch (error) {
      console.error('Error updating leave:', error);
    }
  };

  return (
    <Box sx={{ padding: '30px', backgroundColor: '#f4f7fb', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h4">Leave Management</Typography>
        <Button variant="outlined" onClick={() => navigate('/home')}>
          Back to Home
        </Button>
      </Box>
      <Paper sx={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h6" gutterBottom>
          Request Leave
        </Typography>
        <Divider sx={{ marginBottom: '20px' }} />
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: '220px', flex: 1 }}>
              <InputLabel id="employee-select-label">Employee</InputLabel>
              <Select
                labelId="employee-select-label"
                value={formState.employeeId}
                label="Employee"
                onChange={handleFormChange('employeeId')}
                required
              >
                {employeeOptions.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name} (#{employee.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: '180px', flex: 1 }}>
              <InputLabel id="leave-type-label">Leave Type</InputLabel>
              <Select
                labelId="leave-type-label"
                value={formState.leaveType}
                label="Leave Type"
                onChange={handleFormChange('leaveType')}
                required
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Start Date"
              type="date"
              value={formState.startDate}
              onChange={handleFormChange('startDate')}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: '180px', flex: 1 }}
              required
            />
            <TextField
              label="End Date"
              type="date"
              value={formState.endDate}
              onChange={handleFormChange('endDate')}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: '180px', flex: 1 }}
              required
            />
            <TextField
              label="Reason"
              value={formState.reason}
              onChange={handleFormChange('reason')}
              sx={{ minWidth: '260px', flex: 2 }}
            />
          </Box>
          {formError ? (
            <Typography sx={{ marginTop: '10px' }} color="error">
              {formError}
            </Typography>
          ) : null}
          <Box sx={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <Button type="submit" variant="contained">
              Submit Request
            </Button>
            <Button variant="outlined" onClick={resetForm}>
              Clear
            </Button>
          </Box>
        </Box>
      </Paper>
      <Paper sx={{ padding: '20px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <Typography variant="h6">Leave Requests</Typography>
          <FormControl sx={{ minWidth: '180px' }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusFilters.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave._id}>
                  <TableCell>
                    {leave.employeeName} (#{leave.employeeId})
                  </TableCell>
                  <TableCell>{leave.leaveType}</TableCell>
                  <TableCell>
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </TableCell>
                  <TableCell>{calcDays(leave.startDate, leave.endDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={leave.status}
                      color={
                        leave.status === 'Approved'
                          ? 'success'
                          : leave.status === 'Rejected'
                            ? 'error'
                            : 'warning'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{leave.reason || '-'}</TableCell>
                  <TableCell align="right">
                    {leave.status === 'Pending' && ['Admin', 'Manager'].includes(role) ? (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                        >
                          Reject
                        </Button>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No actions
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
