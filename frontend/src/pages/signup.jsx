import constants from "../constants";
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/signup.css';

function Signup() {
  const link = constants.url + "/api/signup";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords don't match!");
      return;
    }

    try {
      const response = await axios.post(link, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      }, { withCredentials: true });

      localStorage.setItem('token', response.data.token);
      setMessage("Signup successful! Redirecting...");
      navigate('/dashboard');
    } catch (error) {
      console.log(error);
      if (error.response) {
        setMessage(error.response.data.msg || 'Error signing up');
      } else if (error.request) {
        setMessage('No response received from server');
      } else {
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="signup-form">
      <div className="sgn-upper">
        <img src="/customer-logo.png" alt="" />
        <h1>BML Munjal University</h1>
        <p>Create your account to get started.</p>
      </div>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <p className="message">{message}</p>
        <button type="submit">Sign Up</button>
        <p className="login-link">
          Already have an account? <span onClick={() => navigate('/login')}>Login</span>
        </p>
      </form>
    </div>
  );
}

export default Signup;