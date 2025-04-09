import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  CardMedia,
  List,
  ListItem,
  ListItemText,
  styled,
  Box,
} from '@mui/material';

// Styled components for custom styling
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

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
  '& .MuiListItemText-secondary': {
    color: theme.palette.text.secondary,
  },
}));

const UserProfile = () => {
  const { token } = useAuth();
  const { user } = useParams(); // e.g., /user/Chrisjrkiki
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          'http://127.0.0.1:8000/api/user/profiles/',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        console.log('Profiles response:', response.data);

        const userProfile = response.data.results.find(
          (p) => p.username === user,
        );

        if (!userProfile) {
          throw new Error(`Profile for ${user} not found`);
        }

        setProfile(userProfile);
      } catch (err) {
        logger.error(
          'Failed to fetch profile',
          err.response?.data || err.message,
        );
        setError(`Failed to load profile for ${user}`);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [token, user]);

  const isVideo = (url) =>
    /\.(mp4|webm|ogg)$/i.test(url) || url.includes('pexels.com/video');

  const getMediaUrl = (photo) => {
    if (photo.image) {
      return `http://127.0.0.1:8000${photo.image}`;
    }
    if (photo.image_url) {
      if (photo.image_url.includes('pexels.com/video')) {
        return 'https://via.placeholder.com/100?text=Video';
      }
      return photo.image_url;
    }
    return 'https://via.placeholder.com/100';
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
      {/* Profile Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant='h4'
          gutterBottom
          sx={{ fontWeight: 'bold', color: '#333' }}
        >
          {profile.username}'s Profile
        </Typography>
        <Typography variant='body1' color='textSecondary' sx={{ mb: 1 }}>
          Bio: {profile.bio || 'No bio available'}
        </Typography>
        <Typography variant='body1' color='textSecondary'>
          Profile Image: {profile.image ? 'Yes' : 'None'}
        </Typography>
      </Box>

      {/* Albums Section */}
      <Typography
        variant='h5'
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#333', mt: 4 }}
      >
        Albums
      </Typography>
      {profile.albums && profile.albums.length > 0 ? (
        <Grid container spacing={3}>
          {profile.albums.map((album) => (
            <Grid item xs={12} sm={6} md={4} key={album.id}>
              <StyledCard elevation={3}>
                <CardContent sx={{ p: 3 }}>
                  <StyledTypography variant='h6'>
                    <Link
                      to={`/album/${album.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {album.title}
                    </Link>
                  </StyledTypography>
                  <Typography
                    variant='subtitle2'
                    color='textSecondary'
                    sx={{ mb: 2 }}
                  >
                    Photos: {album.photos.length}
                  </Typography>
                  {album.photos.length > 0 ? (
                    <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {album.photos.map((photo) => (
                        <ListItem key={photo.id} sx={{ py: 1 }}>
                          <CardMedia
                            component={
                              isVideo(photo.image_url) ? 'video' : 'img'
                            }
                            src={
                              isVideo(photo.image_url)
                                ? getMediaUrl(photo)
                                : undefined
                            }
                            image={
                              !isVideo(photo.image_url)
                                ? getMediaUrl(photo)
                                : undefined
                            }
                            alt={photo.title}
                            controls={isVideo(photo.image_url)}
                            sx={{
                              width: 80,
                              height: 80,
                              mr: 2,
                              borderRadius: '4px',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              console.error(
                                `Failed to load media for ${photo.title}: ${getMediaUrl(photo)}`,
                              );
                              e.target.src = 'https://via.placeholder.com/80';
                            }}
                          />
                          <StyledListItemText primary={photo.title} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant='body2' color='textSecondary'>
                      No photos in this album
                    </Typography>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography
          variant='body1'
          color='textSecondary'
          align='center'
          sx={{ mt: 2 }}
        >
          No albums found
        </Typography>
      )}
    </Container>
  );
};

export default UserProfile;
