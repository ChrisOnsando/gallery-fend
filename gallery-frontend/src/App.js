import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import UserProfile from './components/UserProfile';
import AlbumPage from './components/AlbumPage';
import PhotoPage from './components/PhotoPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/home' element={<Home />} />
          <Route path='/user/:user' element={<UserProfile />} />
          <Route path='/album/:albumId' element={<AlbumPage />} />
          <Route path='/photo/:photoId' element={<PhotoPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
