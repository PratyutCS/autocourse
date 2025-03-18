import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Sparkles, FileText, Upload, CheckCircle, Eye, BookOpen, Coffee } from 'lucide-react';

const WelcomeCard = ({ userName }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sparkleAnimate, setSparkleAnimate] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  
  useEffect(() => {
    // Create a subtle animation effect for the sparkles icon
    const interval = setInterval(() => {
      setSparkleAnimate(prev => !prev);
    }, 3000);
    
    // Set current time and greeting
    const updateTimeAndGreeting = () => {
      const now = new Date();
      const hours = now.getHours();
      
      let greetingText = 'Good morning';
      if (hours >= 12 && hours < 17) greetingText = 'Good afternoon';
      if (hours >= 17 || hours < 5) greetingText = 'Good evening';
      
      setGreeting(greetingText);
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTimeAndGreeting();
    const timeInterval = setInterval(updateTimeAndGreeting, 60000); // Update every minute
    
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg p-6 border border-gray-100 transform hover:shadow-xl transition-all duration-300">
      {/* Header Section with Time and Greeting */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`bg-gradient-to-r from-orange-400 to-[#FFB255] p-3 rounded-lg shadow-lg ${sparkleAnimate ? 'scale-105' : 'scale-100'} transition-all duration-700`}>
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-800">
                {greeting}, Professor {userName || "Smith"}
              </h1>
              <span className="text-lg text-gray-600">👋</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[#FFB255] font-medium">Course File Generator</p>
              <span className="text-sm text-gray-500 bg-white py-1 px-2 rounded-full shadow-sm">{currentTime}</span>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
            <Coffee className="w-4 h-4 text-[#FFB255] mr-2" />
            <span className="text-sm font-medium text-gray-600">Academic Support</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[600px]' : 'max-h-20'}`}>
        <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg p-5 mb-5 shadow-sm border border-gray-100">
          <p className="text-gray-700 leading-relaxed font-serif">
            Welcome to your Course File Generator dashboard! This intuitive tool streamlines the process of creating comprehensive course files by leveraging AI to extract information from your course handouts.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-5 shadow-md mb-5 border-l-4 border-[#FFB255]">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-[#FFB255]" />
            <h2 className="text-lg font-semibold text-gray-800">How It Works</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 bg-orange-100 w-9 h-9 flex items-center justify-center rounded-full shadow-sm">
                <span className="font-semibold text-[#FFB255]">1</span>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 flex-grow">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-orange-500" />
                  <h3 className="font-medium text-gray-800">Upload Your Course Handout</h3>
                </div>
                <p className="text-gray-600 mt-2 text-sm">
                  Upload your existing course handout document in PDF or DOCX format. 
                  The system supports various file types from standard university templates.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 bg-amber-100 w-9 h-9 flex items-center justify-center rounded-full shadow-sm">
                <span className="font-semibold text-amber-600">2</span>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 flex-grow">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <h3 className="font-medium text-gray-800">AI Extraction & Analysis</h3>
                </div>
                <p className="text-gray-600 mt-2 text-sm">
                  Our advanced AI will analyze your handout and automatically extract relevant academic information to 
                  pre-fill your course file. This scholarly process typically takes just a few moments.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 bg-yellow-100 w-9 h-9 flex items-center justify-center rounded-full shadow-sm">
                <span className="font-semibold text-yellow-600">3</span>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 flex-grow">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-medium text-gray-800">Academic Review & Editing</h3>
                </div>
                <p className="text-gray-600 mt-2 text-sm">
                  Click the "View File" button to review the generated course file. You can edit any field 
                  as needed to ensure pedagogical accuracy and completeness of materials.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 bg-green-100 w-9 h-9 flex items-center justify-center rounded-full shadow-sm">
                <span className="font-semibold text-green-600">4</span>
              </div>
              <div className="bg-green-50 rounded-lg p-4 flex-grow">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-gray-800">Verification & Finalization</h3>
                </div>
                <p className="text-gray-600 mt-2 text-sm">
                  Verify that all academic information is correct, make any necessary pedagogical adjustments, 
                  and finalize your course file for departmental submission or student distribution.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <svg className="w-5 h-5 text-[#FFB255]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd"></path>
              </svg>
            </div>
            <p className="text-gray-700 italic text-sm font-serif">
              <span className="font-semibold">Academic Note:</span> For optimal results, ensure your course handout contains clear information about 
              course objectives, learning outcomes, assessments, and weekly schedule. This will enhance the accuracy 
              of AI extraction and reduce the need for manual adjustments.
            </p>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 flex items-center gap-2 text-[#FFB255] hover:text-orange-500 font-medium transition-colors duration-200 
                  bg-white py-2 px-4 rounded-full shadow-sm hover:shadow-md"
      >
        {isExpanded ? (
          <>
            Show Less <ChevronUp className="w-4 h-4" />
          </>
        ) : (
          <>
            Read More <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};

export default WelcomeCard;