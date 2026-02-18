import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  styled,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import api from './api/client.js';
import { useAuth } from './hooks/useAuth.js';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
};

const Page = styled(Box)({
  minHeight: '100vh',
  background: 'radial-gradient(circle at 20% 20%, rgba(79,172,254,0.15), transparent 55%),\
               radial-gradient(circle at 80% 0%, rgba(0,242,254,0.2), transparent 45%),\
               #f6f8fb',
});

const Hero = styled(Box)({
  borderRadius: '20px',
  padding: '28px 32px',
  background: 'linear-gradient(120deg, #0f2027, #203a43, #2c5364)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 18px 40px rgba(14, 32, 45, 0.25)',
  marginBottom: '24px',
});

const GlassCard = styled(Card)({
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.9)',
  backdropFilter: 'blur(6px)',
  boxShadow: '0 12px 28px rgba(15, 32, 39, 0.08)',
  height: '100%',
});

const StatValue = styled(Typography)({
  fontSize: '2rem',
  fontWeight: 700,
});

const StatLabel = styled(Typography)({
  fontSize: '0.9rem',
  color: '#64748b',
});

const IconBadge = styled(Box)({
  width: 44,
  height: 44,
  borderRadius: 12,
  display: 'grid',
  placeItems: 'center',
  background: 'rgba(15, 118, 110, 0.12)',
  color: '#0f766e',
});

const SectionTitle = styled(Typography)({
  fontWeight: 700,
  marginBottom: '8px',
});

export default function Dashboard() {
  useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error('Failed to load dashboard:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  const summaryCards = useMemo(() => {
    if (!data?.summary) return [];
    return [
      { label: 'Total Employees', value: data.summary.totalEmployees, icon: <PeopleAltIcon /> },
      { label: 'Active Employees', value: data.summary.activeEmployees, icon: <TrendingUpIcon /> },
      { label: 'Present Today', value: data.summary.presentToday, icon: <FactCheckIcon /> },
      { label: 'On Leave Today', value: data.summary.onLeaveToday, icon: <EventNoteIcon /> },
      { label: 'Absent Today', value: data.summary.absentToday, icon: <AccessTimeIcon /> },
      { label: 'Total Projects', value: data.summary.totalProjects, icon: <WorkOutlineIcon /> },
      { label: 'Pending Leave Requests', value: data.summary.pendingLeaves, icon: <EventNoteIcon /> },
    ];
  }, [data]);

  if (loading) {
    return <Typography sx={{ padding: '40px' }}>Loading dashboard...</Typography>;
  }

  if (!data) {
    return <Typography sx={{ padding: '40px' }}>Unable to load dashboard.</Typography>;
  }

  const role = data.role;

  return (
    <Page>
      <Hero>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Welcome back</Typography>
          <Typography sx={{ opacity: 0.85, marginTop: '6px' }}>
            {role === 'Employee'
              ? 'Here is your daily snapshot and upcoming leave info.'
              : 'Here’s the latest workforce pulse and key indicators.'}
          </Typography>
        </Box>
        <Chip
          label={role}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: '#fff',
            fontWeight: 600,
          }}
        />
      </Hero>

      {role === 'Admin' || role === 'Manager' ? (
        <Grid container spacing={2}>
          {summaryCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
              <GlassCard>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <StatLabel>{card.label}</StatLabel>
                    <StatValue>{card.value ?? 0}</StatValue>
                  </Box>
                  <IconBadge>{card.icon}</IconBadge>
                </CardContent>
              </GlassCard>
            </Grid>
          ))}
          <Grid item xs={12} md={6}>
            <GlassCard>
              <CardContent>
                <SectionTitle variant="h6">Today at a glance</SectionTitle>
                <Divider sx={{ marginBottom: '12px' }} />
                <List dense>
                  <ListItem>
                    <ListItemText primary="Present" secondary={`${data.summary.presentToday ?? 0} employees marked`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="On Leave" secondary={`${data.summary.onLeaveToday ?? 0} employees on leave`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Absent" secondary={`${data.summary.absentToday ?? 0} employees absent`} />
                  </ListItem>
                </List>
              </CardContent>
            </GlassCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <GlassCard>
              <CardContent>
                <SectionTitle variant="h6">Operational notes</SectionTitle>
                <Divider sx={{ marginBottom: '12px' }} />
                <Typography color="text.secondary">
                  Pending leave approvals: {data.summary.pendingLeaves ?? 0}
                </Typography>
                <Typography color="text.secondary" sx={{ marginTop: '8px' }}>
                  Active projects: {data.summary.totalProjects ?? 0}
                </Typography>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <GlassCard>
              <CardContent>
                <SectionTitle variant="h6">Your Profile</SectionTitle>
                <Divider sx={{ marginBottom: '16px' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Avatar
                    src={data.profile?.photo ? `${apiBaseUrl}${data.profile.photo}` : ''}
                    sx={{ width: 72, height: 72 }}
                  />
                  <Box>
                    <Typography variant="h6">{data.profile?.name || 'Employee'}</Typography>
                    <Typography color="text.secondary">{data.profile?.current_role || 'Role'}</Typography>
                    <Typography color="text.secondary">{data.profile?.department || 'Department'}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <GlassCard>
              <CardContent>
                <SectionTitle variant="h6">Today Attendance</SectionTitle>
                <Divider sx={{ marginBottom: '12px' }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {data.todayAttendance?.status || 'Not marked'}
                </Typography>
                <Typography color="text.secondary">Check In: {data.todayAttendance?.checkIn || '-'}</Typography>
                <Typography color="text.secondary">Check Out: {data.todayAttendance?.checkOut || '-'}</Typography>
              </CardContent>
            </GlassCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <GlassCard>
              <CardContent>
                <SectionTitle variant="h6">Pending Leaves</SectionTitle>
                <Divider sx={{ marginBottom: '12px' }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {data.pendingLeaveCount ?? 0}
                </Typography>
                <Typography color="text.secondary">
                  Awaiting approval
                </Typography>
              </CardContent>
            </GlassCard>
          </Grid>
          <Grid item xs={12}>
            <GlassCard>
              <CardContent>
                <SectionTitle variant="h6">Upcoming Leaves</SectionTitle>
                <Divider sx={{ marginBottom: '12px' }} />
                {Array.isArray(data.upcomingLeaves) && data.upcomingLeaves.length > 0 ? (
                  <List>
                    {data.upcomingLeaves.map((leave) => (
                      <ListItem key={leave._id} divider>
                        <ListItemText
                          primary={`${leave.leaveType} (${formatDate(leave.startDate)} - ${formatDate(leave.endDate)})`}
                          secondary={leave.reason || 'No reason provided'}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">No upcoming leaves.</Typography>
                )}
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>
      )}
    </Page>
  );
}
