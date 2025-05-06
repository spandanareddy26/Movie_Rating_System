const mongoose = require('mongoose');
const Movie = require('../models/Movie');

// Get All Movies (supports filtering and sorting)
exports.getMovies = async (req, res) => {
  try {
    let query = {};

    // Filtering conditions
    if (req.query.genre) query.genre = req.query.genre;
    if (req.query.releaseYear) query.releaseYear = Number(req.query.releaseYear);
    if (req.query.rating) {
      const movies = await Movie.find();
      const filteredMovies = movies.filter(movie => {
        if (!movie.reviews || movie.reviews.length === 0) return false;
        const avgRating = movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length;
        return avgRating >= Number(req.query.rating);
      });
      return res.status(200).json(filteredMovies);
    }

    let movies = await Movie.find(query);

    if (req.query.sortBy) {
      if (req.query.sortBy === 'rating') {
        movies = movies.sort((a, b) => {
          const avgRatingA = a.reviews.length ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length : 0;
          const avgRatingB = b.reviews.length ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length : 0;
          return avgRatingB - avgRatingA;
        });
      } else if (req.query.sortBy === 'releaseYear') {
        movies = movies.sort((a, b) => b.releaseYear - a.releaseYear);
      }
    }

    res.status(200).json(movies);
  } catch (error) {
    console.error('Error in getMovies:', error.message, error.stack);
    res.status(500).json({ message: 'Server error in getMovies', error: error.message });
  }
};

// Get Published Movies (for Home Page)
exports.getPublishedMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    console.error('Error in getPublishedMovies:', error.message, error.stack);
    res.status(500).json({ message: 'Server error in getPublishedMovies', error: error.message });
  }
};

// Get Movie by ID (for Review Page)
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.status(200).json(movie);
  } catch (error) {
    console.error('Error in getMovieById:', error.message, error.stack);
    res.status(500).json({ message: 'Server error in getMovieById', error: error.message });
  }
};

// Add Movie (Admin only)
exports.addMovie = async (req, res) => {
  const { name, genre, releaseYear, description } = req.body;
  const poster = req.file ? req.file.path : null;

  try {
    if (!name || !genre || !releaseYear || !description || !poster) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate releaseYear is a number
    const releaseYearNum = parseInt(releaseYear, 10);
    if (isNaN(releaseYearNum)) {
      return res.status(400).json({ message: 'Release year must be a valid number' });
    }

    const movie = new Movie({
      name,
      genre,
      releaseYear: releaseYearNum, // Ensure it's a number
      description,
      poster,
      reviews: [],
    });
    await movie.save();
    res.status(201).json({ message: 'Movie added successfully', movie });
  } catch (error) {
    console.error('Error in addMovie:', error.message, error.stack);
    res.status(500).json({ message: 'Server error in addMovie', error: error.message });
  }
};

// Submit Review
exports.submitReview = async (req, res) => {
  const { rating, comment, fullName, emotionTag } = req.body;
  const userEmail = req.user.email;

  try {
    // Validate movieId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    // Validate releaseYear before saving
    if (typeof movie.releaseYear !== 'number') {
      movie.releaseYear = parseInt(movie.releaseYear, 10);
      if (isNaN(movie.releaseYear)) {
        return res.status(400).json({ message: 'Invalid release year in movie data' });
      }
    }

    const existingReview = movie.reviews.find(review => review.userEmail === userEmail);
    if (existingReview) return res.status(400).json({ message: 'You have already reviewed this movie' });

    movie.reviews.push({
      userEmail,
      fullName,
      rating,
      comment,
      emotionTag,
      createdAt: new Date(),
    });
    await movie.save();
    res.status(201).json({ message: 'Review submitted successfully', movie });
  } catch (error) {
    console.error('Error in submitReview:', error.message, error.stack);
    res.status(500).json({ message: 'Server error in submitReview', error: error.message });
  }
};