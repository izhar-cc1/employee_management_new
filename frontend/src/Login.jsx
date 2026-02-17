import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import api from './api/client.js';

const Background = styled(Box)({
  height: '100vh',
  background: 'linear-gradient(to right, #4facfe, #00f2fe)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const LoginCard = styled(Card)({
  maxWidth: 400,
  width: '100%',
  padding: '20px',
  textAlign: 'center',
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
});

const LoginTitle = styled(Typography)({
  marginBottom: '20px',
  fontWeight: 'bold',
  color: '#333',
});

const SubmitButton = styled(Button)({
  marginTop: '20px',
  backgroundColor: '#4caf50',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#45a049',
  },
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Enter email & password');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/login', { email, password });
      const token = response.data?.token;

      if (token) {
        localStorage.setItem('token', token);
      }

      navigate('/home');
    } catch (error) {
      console.error(error);
      alert('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

return (
  <Background>
    <LoginCard>
      <CardContent>
        <LockOutlinedIcon sx={{ fontSize: 40, color: '#4caf50' }} />
        <LoginTitle variant="h5">Sign In</LoginTitle>

        <Typography variant="body2" color="textSecondary" paragraph>
          Please enter your email and password to login.
        </Typography>

        <TextField
          label="Email"
          fullWidth
          margin="normal"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleLogin();
          }}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleLogin();
          }}
        />

        <SubmitButton
          variant="contained"
          fullWidth
          onClick={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? <CircularProgress size={24} /> : "Login"}
        </SubmitButton>
      </CardContent>
    </LoginCard>
  </Background>
);

}
