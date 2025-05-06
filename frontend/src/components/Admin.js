import React, { useState } from 'react';
import axios from 'axios';

const Admin = ({ setMovies }) => {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [description, setDescription] = useState('');
  const [poster, setPoster] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (e.g., JPG, PNG).');
        setPoster(null);
        setPreview(null);
        return;
      }
      setPoster(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !genre || !releaseYear || !description || !poster) {
      setError('All fields are required.');
      setSuccess('');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('genre', genre);
    formData.append('releaseYear', releaseYear);
    formData.append('description', description);
    formData.append('poster', poster);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:15400/api/movies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setMovies(prevMovies => [...prevMovies, response.data.movie]);
      setSuccess('Movie added successfully!');
      setName('');
      setGenre('');
      setReleaseYear('');
      setDescription('');
      setPoster(null);
      setPreview(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add movie. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1>Admin Panel</h1>
        <p>Add a new movie to the database</p>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="input-group">
            <label htmlFor="name">Movie Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter movie name"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="genre">Genre</label>
            <input
              type="text"
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Enter genre (e.g., Action, Comedy)"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="releaseYear">Release Year</label>
            <input
              type="number"
              id="releaseYear"
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              placeholder="Enter release year (e.g., 2023)"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter movie description"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="poster">Movie Poster</label>
            <input
              type="file"
              id="poster"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>
          {preview && (
            <div className="poster-preview">
              <img src={preview} alt="Poster Preview" className="preview-image" />
            </div>
          )}
          <button type="submit" className="auth-button">Add Movie</button>
        </form>
      </div>
    </div>
  );
};

export default Admin;