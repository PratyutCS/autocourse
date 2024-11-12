import constants from "../constants";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/login.css'

// import { useNavigate } from "react-router-dom";

function Login() {
  const link = constants.url + "/api/signin";
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const response = await axios.post(constants.url + '/tokenIsValid', {}, {
            headers: { 'x-auth-token': token }
          });

          if (response.data) {
            navigate('/dashboard');
          } else {
            localStorage.removeItem('token');
            navigate('/');
          }
        } catch (error) {
          console.error("Error validating token:", error);
        }
      }
    };

    checkTokenValidity();
  }, [navigate]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(link, {
        email: username,
        password,
      }, { withCredentials: true });
      localStorage.setItem('token', response.data.token);

      setMessage("Login successful! Redirecting...");
      navigate('/dashboard');
    } catch (error) {
      console.log(error);
      if (error.response) {
        setMessage(error.response.data.msg || 'Error logging in');
      } else if (error.request) {
        setMessage('No response received from server');
      } else {
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="login-form">
      <div className="lgn-upper">
      <img src="/customer-logo.png" alt="" />
      <h1>BML Munjal University</h1>
      <p>Welcome! Please login to continue.</p>
      </div>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p>{message}</p>
        <button className="btn-sb" type="submit">Login</button>
        
        {/* <button type="submit">SignUp</button> */}
      </form>
      <button className="btn-sb sbn" onClick={ () => navigate('/signup')}>Signup</button>
      
    </div>
  );
}

export default Login;
