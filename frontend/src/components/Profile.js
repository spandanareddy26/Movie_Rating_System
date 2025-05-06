import React from 'react';

const Profile = ({ movies, userEmail, userFullName }) => {
  const userReviews = movies
    .map(movie => ({
      movie,
      review: movie.reviews.find(review => review.userEmail === userEmail),
    }))
    .filter(item => item.review);

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2>Profile</h2>
        <p><strong>Username:</strong> {userFullName || 'Not signed in'}</p>
        <p><strong>Email:</strong> {userEmail || 'Not signed in'}</p>
        <div className="user-reviews">
          <h5>Your Reviews</h5>
          {userReviews.length > 0 ? (
            <div>
              {userReviews.map(({ movie, review }, index) => (
                <div key={index} className="review-item">
                  <h4>{movie.name} ({movie.releaseYear})</h4>
                  <p><strong>Rating:</strong> {review.rating}/5</p>
                  <p><strong>Comment:</strong> {review.comment}</p>
                  <p><strong>Emotion:</strong> {review.emotionTag}</p> {/* Display emotion tag */}
                  <p><strong>Date:</strong> {new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't reviewed any movies yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;