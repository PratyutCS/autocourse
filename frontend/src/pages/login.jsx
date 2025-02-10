import constants from "../constants";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import '../css/login.css'
import { ArrowRight, Mail, Lock } from 'lucide-react';


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
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-[antiquewhite] w-full max-w-md rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
        <div className="p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <img 
              src="/customer-logo.png"
              alt="BML Munjal University"
              className="mx-auto mb-4 h-[6rem] rounded-lg transform transition-transform duration-300 hover:scale-105"
            />
            <h1 className="text-2xl font-bold text-gray-700 mb-2 font-['Nunito']">
              BML Munjal University
            </h1>
            <p className="text-gray-500 font-['Space_Grotesk']">
              Welcome! Please login to continue.
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                required
              />
            </div>

            {message && (
              <div className="text-sm text-center text-gray-600">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-white hover:text-black border border-transparent hover:border-gray-900 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Login
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/signup')}
              className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
