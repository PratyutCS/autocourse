import React, { useState, useEffect } from 'react';
import { Clock, Sparkles } from 'lucide-react';

const WelcomeCard = ({ userName = "Avensterna" }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    // Set current time, date, and greeting
    const updateTimeAndGreeting = () => {
      const now = new Date();
      const hours = now.getHours();
      
      let greetingText = 'Good morning';
      if (hours >= 12 && hours < 17) greetingText = 'Good afternoon';
      if (hours >= 17 || hours < 5) greetingText = 'Good evening';
      
      setGreeting(greetingText);
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    
    updateTimeAndGreeting();
    const timeInterval = setInterval(updateTimeAndGreeting, 60000); // Update every minute
    
    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-400 to-[#FFB255] p-2.5 rounded-lg shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          
          <div>
            <h1 className="text-lg font-medium text-gray-800">
              {greeting}, <span className="text-[#FFB255] font-semibold">Prof. {userName}</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Welcome to the Course File Generator
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 py-1.5 px-3.5 rounded-full bg-orange-50 border border-orange-100">
          <Clock className="w-3.5 h-3.5 text-[#FFB255]" />
          <span className="text-gray-700 text-sm">{currentTime}</span>
          <span className="text-orange-200">•</span>
          <span className="text-gray-500 text-sm">{currentDate}</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;