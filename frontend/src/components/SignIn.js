import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignIn = ({ setIsAdmin, setIsSignedIn, setUserEmail, setUserFullName }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (email === 'admin@example.com') {
        console.log('Attempting admin sign-in with:', { email, password });
        const response = await axios.post('http://localhost:15400/api/users/admin/signin', {
          email,
          password,
        });
        console.log('Admin sign-in response:', response.data);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.admin));
        setIsAdmin(true);
        setIsSignedIn(true);
        setUserEmail(email);
        setUserFullName('Admin');
        setSuccess('Admin login successful!');
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        console.log('Attempting user sign-in with:', { email, password });
        const response = await axios.post('http://localhost:15400/api/users/signin', {
          email,
          password,
        });
        console.log('User sign-in response:', response.data);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setIsAdmin(false);
        setIsSignedIn(true);
        setUserEmail(email);
        setUserFullName(response.data.user.fullName);
        setSuccess('Login successful!');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (err) {
      console.error('Sign-in error:', err.response?.data);
      setError(err.response?.data?.message || 'Sign in failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Sign In</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="auth-button">Sign In</button>
        </form>
        <p className="auth-switch">
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;