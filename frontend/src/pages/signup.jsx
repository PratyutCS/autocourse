import constants from "../constants";
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import '../css/signup.css';
import { ArrowRight, Mail, Lock, User } from 'lucide-react';
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
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-[antiquewhite] w-full max-w-md rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
        <div className="p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <img 
              src="/customer-logo.png"
              alt="BML Munjal University"
              className="mx-auto mb-4 h-24 w-auto rounded-lg transform transition-transform duration-300 hover:scale-105"
            />
            <h1 className="text-2xl font-bold text-gray-700 mb-2 font-['Nunito']">
              BML Munjal University
            </h1>
            <p className="text-gray-500 font-['Space_Grotesk']">
              Create your account to get started.
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                required
              />
            </div>

            {message && (
              <div className={`text-sm text-center p-2 rounded ${
                message.includes('successful') 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-red-600 bg-red-50'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-white hover:text-black border border-transparent hover:border-gray-900 transition-all duration-300 flex items-center justify-center gap-2 group mt-6"
            >
              Sign Up
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;