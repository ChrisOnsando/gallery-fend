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

// Styled components
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

const AlbumPage = () => {
  const { token } = useAuth();
  const { albumId } = useParams(); // e.g., /album/5b310f68-1efd-4da4-80d9-527ad09010eb
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        // GET request for the selected album
        const albumResponse = await axios.get(
          `http://127.0.0.1:8000/api/photos/albums/${albumId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        console.log('Album response:', albumResponse.data);

        setAlbum(albumResponse.data);

        // Check if photos are nested; if not, fetch separately
        if (
          albumResponse.data.photos &&
          Array.isArray(albumResponse.data.photos)
        ) {
          setPhotos(albumResponse.data.photos);
        } else {
          // GET request for photos if not nested
          const photosResponse = await axios.get(
            'http://127.0.0.1:8000/api/photos/photos/',
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          console.log('Photos response:', photosResponse.data);
          setPhotos(
            photosResponse.data.filter((photo) => photo.album === albumId),
          );
        }
      } catch (err) {
        logger.error(
          'Failed to fetch album or photos',
          err.response?.data || err.message,
        );
        setError('Failed to load album or photos');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAlbumData();
  }, [token, albumId]);

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
      {/* Album Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant='h4'
          gutterBottom
          sx={{ fontWeight: 'bold', color: '#333' }}
        >
          {album.title}
        </Typography>
        <Typography variant='body1' color='textSecondary'>
          Created by:{' '}
          <Link to={`/user/${album.user}`} style={{ color: 'inherit' }}>
            {album.user}
          </Link>
        </Typography>
        <Typography variant='body1' color='textSecondary'>
          Photos: {photos.length}
        </Typography>
      </Box>

      {/* Photos Section */}
      <Typography
        variant='h5'
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#333', mt: 4 }}
      >
        Photos
      </Typography>
      {photos.length > 0 ? (
        <Grid container spacing={3}>
          {photos.map((photo) => (
            <Grid item xs={12} sm={6} md={4} key={photo.id}>
              <StyledCard elevation={3}>
                <CardMedia
                  component={isVideo(photo.image_url) ? 'video' : 'img'}
                  src={
                    isVideo(photo.image_url) ? getMediaUrl(photo) : undefined
                  }
                  image={
                    !isVideo(photo.image_url) ? getMediaUrl(photo) : undefined
                  }
                  alt={photo.title}
                  controls={isVideo(photo.image_url)}
                  sx={{
                    height: 200,
                    objectFit: 'cover',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                  }}
                  onError={(e) => {
                    console.error(
                      `Failed to load media for ${photo.title}: ${getMediaUrl(photo)}`,
                    );
                    e.target.src = 'https://via.placeholder.com/200';
                  }}
                />
                <CardContent sx={{ p: 2 }}>
                  <StyledTypography variant='h6'>
                    <Link
                      to={`/photo/${photo.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {photo.title}
                    </Link>
                  </StyledTypography>
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
          No photos in this album
        </Typography>
      )}
    </Container>
  );
};

export default AlbumPage;
