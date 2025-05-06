import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Review = ({ movies, setMovies, isSignedIn, userEmail, userFullName }) => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [emotionTag, setEmotionTag] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axios.get(`http://localhost:15400/api/movies/${movieId}`);
        setMovie(response.data);
      } catch (error) {
        console.error('Error fetching movie:', error.response || error.message);
        setError(error.response?.data?.message || 'Error fetching movie details. Please check the server.');
      }
    };
    fetchMovie();
  }, [movieId]);

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 'No reviews';
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return avg.toFixed(1);
  };

  const hasReviewed = movie?.reviews?.some(review => review.userEmail === userEmail) || false;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment || !emotionTag) {
      setError('Please provide a rating, comment, and emotion tag.');
      setSuccess('');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:15400/api/movies/${movieId}/review`,
        { rating, comment, fullName: userFullName, emotionTag },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedMovie = response.data.movie;
      setMovie(updatedMovie);
      setMovies(movies.map(m => (m._id === movieId ? updatedMovie : m)));

      setRating(0);
      setComment('');
      setEmotionTag('');
      setSuccess('Review submitted successfully!');
      setError('');
      setTimeout(() => {
        navigate('/browse');
      }, 1000);
    } catch (error) {
      console.error('Error submitting review:', error.response || error.message);
      setError(error.response?.data?.message || 'Error submitting review. Please check the server.');
      setSuccess('');
    }
  };

  if (!movie) return <div className="review-page text-center text-light py-5">Loading...</div>;

  // Sort reviews from latest to oldest
  const sortedReviews = movie.reviews
    ? [...movie.reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  return (
    <div className="review-page py-5">
      <div className="review-container mx-auto" style={{ maxWidth: '1200px' }}>
        <div className="d-flex flex-wrap gap-4 mb-5">
          <img
            src={
              movie.poster
                ? movie.poster.startsWith("http")
                  ? movie.poster
                  : `http://localhost:15400/${movie.poster}`
                : "/default-poster.jpg"
            }
            alt={`${movie.name} poster`}
            className="review-poster rounded shadow"
            style={{ maxWidth: '300px' }}
          />
          <div className="review-details flex-grow-1">
            <h2 className="mb-3">{movie.name}</h2>
            <p className="mb-2">
              ⭐ {getAverageRating(movie.reviews)} ({movie.reviews.length} reviews) • {movie.releaseYear} • {movie.genre}
            </p>
            <p className="mb-4">{movie.description}</p>

            {/* Review Submission Form */}
            {isSignedIn ? (
              hasReviewed ? (
                <p className="review-message mb-4">You’ve already reviewed this movie.</p>
              ) : (
                <form onSubmit={handleReviewSubmit} className="review-form p-4 mb-5" style={{ width: '100%' }}>
                  <h5 className="mb-4">Rate & Review</h5>
                  {error && <div className="error-message mb-3">{error}</div>}
                  {success && <div className="success-message mb-3">{success}</div>}
                  <div className="input-group mb-3 d-flex align-items-center">
                    <label className="me-3" style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>
                      Your Rating:
                    </label>
                    <div className="star-rating d-flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{ fontSize: '2rem' }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="input-group mb-3">
                    <label htmlFor="emotionTag" className="d-block mb-2" style={{ fontSize: '1rem' }}>
                      How did you feel?
                    </label>
                    <select
                      id="emotionTag"
                      className="form-select filter-select"
                      value={emotionTag}
                      onChange={(e) => setEmotionTag(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        maxWidth: '400px',
                        height: '50px',
                        borderRadius: '10px',
                        border: '1px solid #ced4da',
                        padding: '0 40px 0 15px',
                        fontSize: '1.1rem',
                        backgroundColor: '#fff',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
                        appearance: 'none',
                        cursor: 'pointer',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 15px center',
                        backgroundSize: '20px',
                      }}
                    >
                      <option value="">Select an emotion</option>
                      <option value="Happy">Happy</option>
                      <option value="Sad">Sad</option>
                      <option value="Scary">Scary</option>
                      <option value="Thrilled">Thrilled</option>
                      <option value="Funny">Funny</option>
                      <option value="Romantic">Romantic</option>
                    </select>
                  </div>
                  <div className="input-group mb-3">
                    <textarea
                      id="comment"
                      className="form-control search-input"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your review here..."
                      rows="4"
                      required
                      style={{ width: '100%' }}
                    />
                  </div>
                  <button type="submit" className="auth-button w-100">Submit Review</button>
                </form>
              )
            ) : (
              <p className="signin-prompt mb-4">
                Please <Link to="/signin" className="text-decoration-none">sign in</Link> to leave a review.
              </p>
            )}

            {/* Reviews Section */}
            <h5 className="mb-4">Reviews</h5>
            {sortedReviews.length > 0 ? (
              <div>
                {sortedReviews.map((review, index) => (
                  <div key={index} className="review-item p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <span className="review-rating me-2">{review.rating}/5</span>
                        <strong>{review.fullName}</strong>
                      </div>
                      <small>{new Date(review.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p className="mb-2">{review.comment}</p>
                    <p className="mb-0"><strong>Emotion:</strong> {review.emotionTag}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-light mb-4">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;