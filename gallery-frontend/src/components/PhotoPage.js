import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';
import logger from '../services/logger';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardMedia,
} from '@mui/material';

const PhotoPage = () => {
  const { token } = useAuth();
  const { photoId } = useParams();
  const [photo, setPhoto] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/photos/${photoId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setPhoto(response.data);
        setTitle(response.data.title);
      } catch (err) {
        logger.error('Failed to fetch photo', err);
        setError('Failed to load photo');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPhoto();
  }, [token, photoId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/photos/${photoId}/`,
        { title },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPhoto(response.data);
      setEditMode(false);
      logger.info('Photo title updated');
    } catch (err) {
      logger.error('Failed to update photo', err);
      setError('Failed to update photo');
    }
  };

  if (!token) return <Typography align='center'>Please log in.</Typography>;
  if (loading) return <Loader />;
  if (error)
    return (
      <Typography color='error' align='center'>
        {error}
      </Typography>
    );

  return (
    <Container maxWidth='md' sx={{ mt: 4 }}>
      <Typography variant='h4' gutterBottom>
        Photo
      </Typography>
      <Card>
        <CardMedia
          component='img'
          image={
            photo.image || photo.image_url || 'https://via.placeholder.com/400'
          }
          alt={photo.title}
          sx={{ maxHeight: 400, objectFit: 'contain' }}
        />
        <Box p={2}>
          {editMode ? (
            <form onSubmit={handleUpdate}>
              <TextField
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                margin='normal'
              />
              <Box mt={2}>
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  sx={{ mr: 1 }}
                >
                  Save
                </Button>
                <Button variant='outlined' onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </Box>
            </form>
          ) : (
            <>
              <Typography variant='h6'>{photo.title}</Typography>
              <Button
                variant='contained'
                color='primary'
                onClick={() => setEditMode(true)}
                sx={{ mt: 2 }}
              >
                Edit Title
              </Button>
            </>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default PhotoPage;
