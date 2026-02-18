import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Grid,
  Divider,
  styled,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import api from './api/client.js';
import { formatToInputDate } from './utils/date.js';

const Page = styled(Box)({
  minHeight: '100vh',
  background: 'radial-gradient(circle at 15% 20%, rgba(79,172,254,0.16), transparent 45%),\
               radial-gradient(circle at 85% 0%, rgba(0,242,254,0.18), transparent 40%),\
               #f6f8fb',
  padding: '24px',
});

const Hero = styled(Box)({
  borderRadius: '22px',
  padding: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'linear-gradient(120deg, #0f172a, #1e293b, #164e63)',
  color: '#fff',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.25)',
  marginBottom: '20px',
});

const GlassCard = styled(Card)({
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(6px)',
  boxShadow: '0 12px 28px rgba(15, 32, 39, 0.08)',
  height: '100%',
});

const Label = styled(Typography)({
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#64748b',
  fontWeight: 600,
});

const Value = styled(Typography)({
  fontSize: '1rem',
  fontWeight: 600,
  color: '#0f172a',
});

const Field = ({ label, value, editing, name, type = 'text', options = [], onChange }) => (
  <Box sx={{ marginBottom: '14px' }}>
    <Label>{label}</Label>
    {editing ? (
      options.length ? (
        <TextField
          select
          fullWidth
          size="small"
          name={name}
          value={value || ''}
          onChange={onChange}
          sx={{ marginTop: '6px' }}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <TextField
          fullWidth
          size="small"
          name={name}
          value={value || ''}
          type={type}
          onChange={onChange}
          sx={{ marginTop: '6px' }}
        />
      )
    ) : (
      <Value sx={{ marginTop: '6px' }}>{value || '—'}</Value>
    )}
  </Box>
);

export default function EmployeeDetails() {
  useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { employeeId } = location.state || {};
  const [employee, setEmployee] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const statusOptions = ['Active', 'Terminated', 'Resigned', 'Retired'];
  const role = localStorage.getItem('role') || 'Employee';

  const qualificationOptions = ['B.E', 'M.E', 'B.Tech', 'M.Tech', 'BBA', 'MBA', 'MCA', 'BCA', 'B.Sc', 'M.Sc'];
  const roleOptions = ['Intern', 'Trainee', 'Junior', 'Senior', 'Team Lead', 'Manager'];
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

  useEffect(() => {
    if (employeeId) {
      api.get(`/getEmployee/id/${employeeId}`)
        .then(response => {
          const employeeData = response.data;
          employeeData.joining_date = formatToInputDate(employeeData.joining_date);
          employeeData.DoB = formatToInputDate(employeeData.DoB);
          const projectIds = employeeData.projects?.projectId || [];

          if (Array.isArray(projectIds) && projectIds.length > 0) {
            Promise.all(
              projectIds.map(id =>
                api.get(`/projects/${id}`)
                  .then(response => response.data)
              )
            )
              .then(projects => {
                setProjects(projects.map(project => ({ id: project._id, name: project.name })));
              })
              .catch(error => console.error('Error fetching projects:', error));
          }

          setEmployee(employeeData);
          setEditedEmployee(employeeData);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching employee data:', error);
          setError('Failed to fetch employee data.');
          setLoading(false);
        });
    } else {
      setError('No employee ID provided.');
      setLoading(false);
    }
  }, [employeeId]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEditedEmployee((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = () => {
    api.put(`/editEmployee/editbyid/${employeeId}`, editedEmployee)
      .then(() => {
        setEmployee(editedEmployee);
        setIsEditing(false);
      })
      .catch(error => {
        console.error('Error updating employee data:', error);
        setError('Failed to update employee data.');
      });
  };

  const handleStatusClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStatusClose = (status) => {
    if (status) {
      api.put(`/editEmployee/editbyid/${employeeId}`, { ...editedEmployee, status })
        .then(() => {
          setEditedEmployee((prev) => ({ ...prev, status }));
          setEmployee((prev) => ({ ...prev, status }));
        })
        .catch(error => {
          console.error('Error updating employee status:', error);
          setError('Failed to update employee status.');
        });
    }
    setAnchorEl(null);
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this employee? This action cannot be undone.')) {
      return;
    }
    api.delete(`/deleteEmployee/id/${employeeId}`)
      .then(() => {
        navigate('/home');
      })
      .catch((error) => {
        console.error('Error deleting employee:', error);
        setError('Failed to delete employee.');
      });
  };

  if (loading) {
    return <Typography variant="h6" align="center">Loading employee data...</Typography>;
  }

  if (error) {
    return <Typography variant="h6" align="center" color="error">{error}</Typography>;
  }

  if (!employee) {
    return <Typography variant="h6" align="center">No employee data available.</Typography>;
  }

  return (
    <Page>
      <Hero>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Avatar
            src={employee.photo ? `${apiBaseUrl}${employee.photo}` : ''}
            alt={`${employee.first_name} ${employee.last_name}`}
            sx={{ width: 72, height: 72, border: '2px solid rgba(255,255,255,0.5)' }}
          />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {employee.first_name} {employee.last_name}
            </Typography>
            <Typography sx={{ opacity: 0.8 }}>
              {employee.current_role || 'Role'} · {employee.department || 'Department'}
            </Typography>
            <Typography sx={{ opacity: 0.75, marginTop: '6px' }}>
              Employee ID: {employee.id}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Chip
            label={employee.status || 'Status'}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: 600,
            }}
          />
          <Button variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }} onClick={() => navigate('/home')}>
            Back
          </Button>
          {role === 'Admin' ? (
            <>
              <Button variant="contained" color="warning" onClick={isEditing ? handleSave : handleEditClick}>
                {isEditing ? 'Save' : 'Edit'}
              </Button>
              <Button variant="contained" color="info" onClick={handleStatusClick}>
                Status
              </Button>
              <Button variant="contained" color="error" onClick={handleDelete}>
                Delete
              </Button>
            </>
          ) : null}
        </Box>
      </Hero>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleStatusClose()}>
        {statusOptions.map(option => (
          <MenuItem key={option} onClick={() => handleStatusClose(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: '8px' }}>Personal</Typography>
              <Divider sx={{ marginBottom: '12px' }} />
              <Field label="Email" value={editedEmployee.email} editing={isEditing} name="email" onChange={handleChange} />
              <Field label="Phone" value={editedEmployee.phone_number} editing={isEditing} name="phone_number" onChange={handleChange} />
              <Field label="Date of Birth" value={editedEmployee.DoB} editing={isEditing} name="DoB" type="date" onChange={handleChange} />
              <Field label="Address" value={editedEmployee.address} editing={isEditing} name="address" onChange={handleChange} />
              <Field label="Aadhar" value={editedEmployee.aadhar_number} editing={isEditing} name="aadhar_number" onChange={handleChange} />
            </CardContent>
          </GlassCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: '8px' }}>Employment</Typography>
              <Divider sx={{ marginBottom: '12px' }} />
              <Field label="Current Role" value={editedEmployee.current_role} editing={isEditing} name="current_role" options={roleOptions} onChange={handleChange} />
              <Field label="Department" value={editedEmployee.department} editing={isEditing} name="department" onChange={handleChange} />
              <Field label="Joining Date" value={editedEmployee.joining_date} editing={isEditing} name="joining_date" type="date" onChange={handleChange} />
              <Field label="Status" value={editedEmployee.status} editing={false} />
            </CardContent>
          </GlassCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: '8px' }}>Education</Typography>
              <Divider sx={{ marginBottom: '12px' }} />
              <Field label="Qualification" value={editedEmployee.highest_qualification} editing={isEditing} name="highest_qualification" options={qualificationOptions} onChange={handleChange} />
              <Field label="University" value={editedEmployee.university} editing={isEditing} name="university" onChange={handleChange} />
              <Field label="Graduation Year" value={editedEmployee.year_of_graduation} editing={isEditing} name="year_of_graduation" onChange={handleChange} />
              <Field label="Percentage" value={editedEmployee.percentage} editing={isEditing} name="percentage" onChange={handleChange} />
            </CardContent>
          </GlassCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: '8px' }}>Bank</Typography>
              <Divider sx={{ marginBottom: '12px' }} />
              <Field label="Bank Name" value={editedEmployee.bank_name} editing={isEditing} name="bank_name" onChange={handleChange} />
              <Field label="Account Number" value={editedEmployee.account_number} editing={isEditing} name="account_number" onChange={handleChange} />
              <Field label="IFSC" value={editedEmployee.ifsc_code} editing={isEditing} name="ifsc_code" onChange={handleChange} />
            </CardContent>
          </GlassCard>
        </Grid>

        <Grid item xs={12}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: '8px' }}>Skills</Typography>
              <Divider sx={{ marginBottom: '12px' }} />
              {Array.isArray(employee.skills) && employee.skills.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {employee.skills.map((skill) => (
                    <Chip key={skill} label={skill} />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No skills listed.</Typography>
              )}
            </CardContent>
          </GlassCard>
        </Grid>

        <Grid item xs={12}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: '8px' }}>Projects</Typography>
              <Divider sx={{ marginBottom: '12px' }} />
              {projects.length > 0 ? (
                <List>
                  {projects.map((project) => (
                    <ListItem key={project.id} divider>
                      <ListItemText primary={project.name} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">No projects assigned.</Typography>
              )}
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>
    </Page>
  );
}
