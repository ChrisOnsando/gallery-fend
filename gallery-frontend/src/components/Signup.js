import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
} from '@mui/material';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSymbol = /[!@#$%^&*]/.test(pwd);
    const isLongEnough = pwd.length >= 8;
    return (
      hasUpperCase && hasLowerCase && hasDigit && hasSymbol && isLongEnough
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', { username, email, password });

    if (!validatePassword(password)) {
      setError(
        'Password must be 8+ characters with uppercase, lowercase, digit, and symbol',
      );
      console.log('Password validation failed');
      return;
    }

    try {
      console.log('Sending signup request to backend...');
      const response = await axios.post(
        'http://127.0.0.1:8000/api/user/register/',
        { username, email, password },
      );
      console.log('Signup response:', response.status, response.data);

      if (response.status === 201) {
        console.log('Signup successful, attempting auto-login...');
        const loginResult = await login(email, password);
        console.log('Login result:', loginResult);

        if (loginResult.success) {
          console.log('Auto-login successful, navigating to /home');
          navigate('/home');
        } else {
          setError('Auto-login failed after signup');
          console.log('Auto-login failed:', loginResult.error);
        }
      }
    } catch (err) {
      console.error('Signup error full response:', err.response?.data); // Log full error data
      console.error('Signup error status:', err.response?.status);
      const errorMsg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] || // Handle non-field errors
        'Signup failed';
      setError(
        errorMsg === 'user with this email already exists.'
          ? 'Email already taken'
          : errorMsg === 'A user with that username already exists.'
            ? 'Username already taken'
            : errorMsg,
      );
    }
  };

  return (
    <Container maxWidth='sm' sx={{ mt: 8 }}>
      <Typography variant='h4' gutterBottom>
        Sign Up
      </Typography>
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          required
          margin='normal'
        />
        <TextField
          label='Email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          margin='normal'
        />
        <TextField
          label='Password'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          margin='normal'
        />
        <Box mt={2}>
          <Button type='submit' variant='contained' color='secondary' fullWidth>
            Sign Up
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default Signup;
