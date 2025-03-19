import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Sparkles, FileText, Upload, CheckCircle, Eye, BookOpen, Coffee, Clock, Info } from 'lucide-react';

const WelcomeCard = ({ userName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sparkleAnimate, setSparkleAnimate] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    // Create a subtle animation effect for the sparkles icon
    const interval = setInterval(() => {
      setSparkleAnimate(prev => !prev);
    }, 3000);
    
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
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-white to-orange-100 rounded-2xl p-6 border border-gray-200 transform  ">
      {/* Header Section with Time and Greeting */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div className={`bg-gradient-to-br from-orange-400 to-[#FFB255] p-3 rounded-xl shadow-xl ring-4 ring-orange-100 ${sparkleAnimate ? 'scale-105' : 'scale-100'} transition-all duration-700`}>
            <Sparkles className="w-6 h-6 text-white drop-shadow-md" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                {greeting}, Professor {userName || "Smith"}
              </h1>
              <span className="text-lg animate-pulse">👋</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-sm text-[#FFB255] font-semibold">Course File Generator</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-white py-1 px-3 rounded-full shadow-sm border border-orange-100">
                <Clock className="w-3 h-3 text-orange-400" />
                <span>{currentTime}</span>
                <span className="text-gray-400">•</span>
                <span>{currentDate}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-md border border-orange-100 hover:bg-orange-50 transition-colors cursor-pointer group">
            <Coffee className="w-4 h-4 text-[#FFB255] mr-2 group-hover:text-orange-500 transition-colors" />
            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Academic Support</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[800px]' : 'max-h-20'}`}>
        <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-5 mb-5 shadow-md border border-orange-100">
          <p className="text-gray-700 leading-relaxed font-serif text-base">
            Welcome to your <span className="font-semibold text-[#FFB255]">Course File Generator</span> dashboard! This tool streamlines the process of creating course files by leveraging AI to extract information from your course handouts.
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-5 shadow-lg mb-5 border-l-4 border-[#FFB255] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100 to-transparent opacity-60 rounded-bl-full"></div>
          
          <div className="flex items-center gap-2 mb-4 relative">
            <BookOpen className="w-5 h-5 text-[#FFB255]" />
            <h2 className="text-lg font-bold text-gray-800">How It Works</h2>
          </div>
          
          <div className="space-y-4 relative">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 bg-gradient-to-br from-orange-200 to-orange-100 w-8 h-8 flex items-center justify-center rounded-full shadow-md">
                <span className="font-bold text-[#FFB255] text-sm">1</span>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-white rounded-xl p-4 flex-grow shadow-sm hover:shadow-md transition-shadow border border-orange-100">
                <div className="flex items-center gap-2 mb-1">
                  <Upload className="w-4 h-4 text-orange-500" />
                  <h3 className="font-semibold text-gray-800 text-base">Upload Your Course Handout</h3>
                </div>
                <p className="text-gray-700 mt-1 text-sm">
                  Upload your existing course handout document in PDF or DOCX format. 
                  The system supports various file types from standard university templates.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 bg-gradient-to-br from-amber-200 to-amber-100 w-8 h-8 flex items-center justify-center rounded-full shadow-md">
                <span className="font-bold text-amber-600 text-sm">2</span>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-white rounded-xl p-4 flex-grow shadow-sm hover:shadow-md transition-shadow border border-amber-100">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <h3 className="font-semibold text-gray-800 text-base">AI Extraction & Analysis</h3>
                </div>
                <p className="text-gray-700 mt-1 text-sm">
                  Our AI will analyze your handout and automatically extract relevant academic information to 
                  pre-fill your course file. This process typically takes just a few moments.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 bg-gradient-to-br from-yellow-200 to-yellow-100 w-8 h-8 flex items-center justify-center rounded-full shadow-md">
                <span className="font-bold text-yellow-600 text-sm">3</span>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-white rounded-xl p-4 flex-grow shadow-sm hover:shadow-md transition-shadow border border-yellow-100">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-yellow-600" />
                  <h3 className="font-semibold text-gray-800 text-base">Review & Editing</h3>
                </div>
                <p className="text-gray-700 mt-1 text-sm">
                  Click the "View File" button to review the generated course file. You can edit any field 
                  as needed to ensure accuracy and completeness of materials.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 bg-gradient-to-br from-green-200 to-green-100 w-8 h-8 flex items-center justify-center rounded-full shadow-md">
                <span className="font-bold text-green-600 text-sm">4</span>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-white rounded-xl p-4 flex-grow shadow-sm hover:shadow-md transition-shadow border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <h3 className="font-semibold text-gray-800 text-base">Verification & Finalization</h3>
                </div>
                <p className="text-gray-700 mt-1 text-sm">
                  Verify that all information is correct, make any necessary adjustments, 
                  and finalize your course file for departmental submission or student distribution.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-white rounded-xl p-4 border border-orange-200 shadow-md">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0 bg-white p-1.5 rounded-full shadow-md">
              <Info className="w-4 h-4 text-[#FFB255]" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1 text-sm">Pro Tip</h4>
              <p className="text-gray-700 text-xs leading-relaxed font-serif">
                For optimal results, ensure your course handout contains clear information about 
                course objectives, learning outcomes, assessments, and weekly schedule. This will enhance the accuracy 
                of AI extraction and reduce manual adjustments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-[#FFB255] hover:text-orange-600 font-medium transition-all duration-300 
                    bg-white py-2 px-4 rounded-full shadow-md hover:shadow-lg border border-orange-200 text-sm group"
        >
          {isExpanded ? (
            <>
              <span>Show Less</span> <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            </>
          ) : (
            <>
              <span>Read More</span> <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WelcomeCard;