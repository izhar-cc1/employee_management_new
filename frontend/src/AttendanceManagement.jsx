import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
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

const statusOptions = ['Present', 'Absent', 'Leave', 'Half Day', 'WFH'];
const statusFilters = ['All', ...statusOptions];

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
};

export default function AttendanceManagement() {
  useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editState, setEditState] = useState({ status: '', checkIn: '', checkOut: '', notes: '' });
  const [formState, setFormState] = useState({
    employeeId: '',
    date: '',
    status: '',
    checkIn: '',
    checkOut: '',
    notes: '',
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

  const fetchAttendance = async () => {
    try {
      const params = {};
      if (statusFilter && statusFilter !== 'All') {
        params.status = statusFilter;
      }
      if (dateFilter) {
        params.date = dateFilter;
      }
      const response = await api.get('/attendance', { params });
      setRecords(response.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [statusFilter, dateFilter]);

  const handleFormChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetForm = () => {
    setFormState({ employeeId: '', date: '', status: '', checkIn: '', checkOut: '', notes: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const { employeeId, date, status } = formState;
    if (!employeeId || !date || !status) {
      setFormError('Please fill all required fields.');
      return;
    }

    try {
      await api.post('/attendance', {
        employeeId: Number(employeeId),
        date,
        status,
        checkIn: formState.checkIn,
        checkOut: formState.checkOut,
        notes: formState.notes,
      });
      resetForm();
      fetchAttendance();
    } catch (error) {
      console.error('Error creating attendance:', error);
      if (error?.response?.status === 409) {
        setFormError('Attendance already exists for this employee on this date.');
      } else {
        setFormError('Failed to create attendance.');
      }
    }
  };

  const handleQuickStatus = async (recordId, status) => {
    try {
      await api.patch(`/attendance/${recordId}`, { status });
      fetchAttendance();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const startEdit = (record) => {
    setEditingId(record._id);
    setEditState({
      status: record.status || '',
      checkIn: record.checkIn || '',
      checkOut: record.checkOut || '',
      notes: record.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState({ status: '', checkIn: '', checkOut: '', notes: '' });
  };

  const saveEdit = async (recordId) => {
    try {
      await api.patch(`/attendance/${recordId}`, editState);
      cancelEdit();
      fetchAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  return (
    <Box sx={{ padding: '30px', backgroundColor: '#f4f7fb', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h4">Attendance Management</Typography>
        <Button variant="outlined" onClick={() => navigate('/home')}>
          Back to Home
        </Button>
      </Box>

      <Paper sx={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h6" gutterBottom>
          Mark Attendance
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
            <TextField
              label="Date"
              type="date"
              value={formState.date}
              onChange={handleFormChange('date')}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: '180px', flex: 1 }}
              required
            />
            <FormControl sx={{ minWidth: '180px', flex: 1 }}>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={formState.status}
                label="Status"
                onChange={handleFormChange('status')}
                required
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Check In"
              placeholder="09:30"
              value={formState.checkIn}
              onChange={handleFormChange('checkIn')}
              sx={{ minWidth: '140px', flex: 1 }}
            />
            <TextField
              label="Check Out"
              placeholder="18:00"
              value={formState.checkOut}
              onChange={handleFormChange('checkOut')}
              sx={{ minWidth: '140px', flex: 1 }}
            />
            <TextField
              label="Notes"
              value={formState.notes}
              onChange={handleFormChange('notes')}
              sx={{ minWidth: '220px', flex: 2 }}
            />
          </Box>
          {formError ? (
            <Typography sx={{ marginTop: '10px' }} color="error">
              {formError}
            </Typography>
          ) : null}
          <Box sx={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <Button type="submit" variant="contained">
              Save Attendance
            </Button>
            <Button variant="outlined" onClick={resetForm}>
              Clear
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ padding: '20px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <Typography variant="h6">Attendance Records</Typography>
          <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <TextField
              label="Date"
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: '160px' }}
            />
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
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Quick Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>
                    {record.employeeName} (#{record.employeeId})
                  </TableCell>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>
                    {editingId === record._id ? (
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                          value={editState.status}
                          onChange={(event) => setEditState((prev) => ({ ...prev, status: event.target.value }))}
                        >
                          {statusOptions.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      record.status
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === record._id ? (
                      <TextField
                        size="small"
                        value={editState.checkIn}
                        onChange={(event) => setEditState((prev) => ({ ...prev, checkIn: event.target.value }))}
                      />
                    ) : (
                      record.checkIn || '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === record._id ? (
                      <TextField
                        size="small"
                        value={editState.checkOut}
                        onChange={(event) => setEditState((prev) => ({ ...prev, checkOut: event.target.value }))}
                      />
                    ) : (
                      record.checkOut || '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === record._id ? (
                      <TextField
                        size="small"
                        value={editState.notes}
                        onChange={(event) => setEditState((prev) => ({ ...prev, notes: event.target.value }))}
                      />
                    ) : (
                      record.notes || '-'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {editingId === record._id ? (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <Button size="small" variant="contained" onClick={() => saveEdit(record._id)}>
                          Save
                        </Button>
                        <Button size="small" variant="outlined" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => startEdit(record)}
                        >
                          Edit
                        </Button>
                        {statusOptions.map((status) => (
                          <Button
                            key={`${record._id}-${status}`}
                            size="small"
                            variant={record.status === status ? 'contained' : 'outlined'}
                            onClick={() => handleQuickStatus(record._id, status)}
                          >
                            {status}
                          </Button>
                        ))}
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No attendance records found.
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
