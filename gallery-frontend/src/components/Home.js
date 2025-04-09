import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';
import logger from '../services/logger';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  styled,
} from '@mui/material';

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
  borderRadius: '12px',
  backgroundColor: '#fff',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.primary.main,
}));

const Home = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching with token:', token);
        const [usersRes, albumsRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/user/users/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://127.0.0.1:8000/api/photos/albums/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log('Raw Users Response:', usersRes.data);
        console.log('Raw Albums Response:', albumsRes.data);

        const usersData = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data.results || [];
        const albumsData = Array.isArray(albumsRes.data)
          ? albumsRes.data
          : albumsRes.data.results || [];

        console.log('Processed Users Data:', usersData);
        console.log('Processed Albums Data:', albumsData);

        setUsers(usersData);
        setAlbums(albumsData);
      } catch (err) {
        console.error('Error details:', err.response || err.message);
        logger.error('Failed to fetch data', err.response?.data || err.message);
        setError(
          `Failed to load data: ${err.response?.status || ''} - ${err.response?.data?.detail || err.message}`,
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const getUserAlbums = (userId) => {
    if (!Array.isArray(albums)) {
      console.warn('albums is not an array:', albums);
      return [];
    }
    const userAlbums = albums.filter((album) => album.user === userId);
    console.log(`Albums for user ${userId}:`, userAlbums);
    return userAlbums;
  };

  const getPhotoCount = (userId) => {
    const userAlbums = getUserAlbums(userId);
    const photoCount = userAlbums.reduce(
      (count, album) => count + (album.photos?.length || 0),
      0,
    );
    console.log(`Photo count for user ${userId}:`, photoCount);
    return photoCount;
  };

  if (!token)
    return (
      <Typography align='center' sx={{ mt: 4 }}>
        Please log in.
      </Typography>
    );
  if (loading) return <Loader />;
  if (error)
    return (
      <Typography color='error' align='center' sx={{ mt: 4 }}>
        {error}
      </Typography>
    );

  return (
    <Container maxWidth='lg' sx={{ mt: 6, mb: 4 }}>
      <Typography
        variant='h4'
        gutterBottom
        align='center'
        sx={{ fontWeight: 'bold', color: '#333', mb: 4 }}
      >
        All Users
      </Typography>
      {users.length === 0 ? (
        <Typography align='center' color='textSecondary' sx={{ mt: 4 }}>
          No users found.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {users.map((user) => {
            const userAlbums = getUserAlbums(user.id);
            const photoCount = getPhotoCount(user.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <StyledCard elevation={3}>
                  <CardContent sx={{ p: 3 }}>
                    <StyledTypography variant='h6'>
                      <Link
                        to={`/user/${user.username}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {user.username}
                      </Link>
                    </StyledTypography>
                    <Typography
                      variant='subtitle2'
                      color='textSecondary'
                      sx={{ mt: 1 }}
                    >
                      Albums: {userAlbums.length}
                    </Typography>
                    <Typography
                      variant='subtitle2'
                      color='textSecondary'
                      sx={{ mt: 0.5 }}
                    >
                      Photos: {photoCount}
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default Home;
