import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  styled,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ReportIcon from '@mui/icons-material/Report';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { useAuth } from '../hooks/useAuth.js';
import api from '../api/client.js';

const Background = styled(Box)({
  height: '100vh',
  backgroundColor: '#fff',
  display: 'flex',
});

const Sidebar = styled(Box)({
  background: 'linear-gradient(to right, #4facfe, #00f2fe)',
  width: '240px',
  padding: '20px',
  boxShadow: '2px 0px 8px rgba(0, 0, 0, 0.1)',
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  overflowY: 'auto',
});

const SidebarItem = styled(ListItem)({
  marginBottom: '10px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
});

const ContentArea = styled(Box)({
  flex: 1,
  padding: '40px',
  overflowY: 'auto',
  marginLeft: '240px',
});

export default function SidebarLayout() {
  useAuth();
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'Employee';

  const handleLogout = () => {
    api.post('/logout')
      .then(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('employeeId');
        navigate('/');
      })
      .catch((error) => {
        console.error('Error during logout:', error);
      });
  };

  const goHomeView = (view) => {
    navigate(`/home?view=${view}`);
  };

  return (
    <Background>
      <Sidebar>
        <Typography variant="h6" gutterBottom>
          <DashboardIcon sx={{ marginRight: '10px', verticalAlign: 'middle' }} />
          Dashboard
        </Typography>
        <Divider sx={{ marginBottom: '20px' }} />
        <List>
          <SidebarItem button onClick={() => navigate('/dashboard')}>
            <DashboardIcon sx={{ marginRight: '10px' }} />
            <ListItemText primary="Overview" />
          </SidebarItem>
          {role !== 'Employee' ? (
            <>
              <SidebarItem button onClick={() => goHomeView('employees')}>
                <PeopleIcon sx={{ marginRight: '10px' }} />
                <ListItemText primary="Employees" />
              </SidebarItem>
              <SidebarItem button onClick={() => goHomeView('departments')}>
                <DashboardIcon sx={{ marginRight: '10px' }} />
                <ListItemText primary="Departments" />
              </SidebarItem>
              <SidebarItem button onClick={() => goHomeView('projects')}>
                <WorkOutlineIcon sx={{ marginRight: '10px' }} />
                <ListItemText primary="Projects" />
              </SidebarItem>
              <SidebarItem button onClick={() => goHomeView('status')}>
                <ReportIcon sx={{ marginRight: '10px' }} />
                <ListItemText primary="Status" />
              </SidebarItem>
              {role === 'Admin' ? (
                <SidebarItem button onClick={() => navigate('/add-employee')}>
                  <PersonAddAltIcon sx={{ marginRight: '10px' }} />
                  <ListItemText primary="Add Employee" />
                </SidebarItem>
              ) : null}
            </>
          ) : null}
          <SidebarItem button onClick={() => navigate('/leave-management')}>
            <EventNoteIcon sx={{ marginRight: '10px' }} />
            <ListItemText primary="Leave Management" />
          </SidebarItem>
          <SidebarItem button onClick={() => navigate('/attendance-management')}>
            <AccessTimeIcon sx={{ marginRight: '10px' }} />
            <ListItemText primary="Attendance" />
          </SidebarItem>
          <SidebarItem button onClick={handleLogout}>
            <LogoutIcon sx={{ marginRight: '10px' }} />
            <ListItemText primary="LogOut" />
          </SidebarItem>
        </List>
      </Sidebar>
      <ContentArea>
        <Outlet />
      </ContentArea>
    </Background>
  );
}
