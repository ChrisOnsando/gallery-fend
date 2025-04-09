import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

const Landing = () => (
  <Container maxWidth='md' sx={{ textAlign: 'center', mt: 8 }}>
    <Typography variant='h2' gutterBottom>
      Welcome to Gallery App
    </Typography>
    <Typography variant='h6' gutterBottom>
      A platform to manage your photo albums. Create, view, and share your
      memories with ease.
    </Typography>
    <Box mt={4}>
      <Button
        variant='contained'
        color='primary'
        component={Link}
        to='/login'
        sx={{ mr: 2 }}
      >
        Login
      </Button>
      <Button
        variant='contained'
        color='secondary'
        component={Link}
        to='/signup'
      >
        Sign Up
      </Button>
    </Box>
  </Container>
);

export default Landing;
