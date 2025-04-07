import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Sparkles, FileText, Upload, CheckCircle, Eye, BookOpen, Coffee, Clock, Info, Stars } from 'lucide-react';

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

  // Decorative background elements
  const decorativeElements = (
    <>
      <div className="absolute top-10 right-10 w-24 h-24 bg-orange-200 rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-10 left-20 w-32 h-32 bg-yellow-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-orange-300 rounded-full opacity-10 blur-xl"></div>
    </>
  );

  return (
    <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 md:p-8 border border-orange-100 transform relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500">
      {decorativeElements}
      
      {/* Header Section with Time and Greeting */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`bg-gradient-to-br from-orange-400 to-[#FFB255] p-3 rounded-xl shadow-xl ring-4 ring-orange-100 ${sparkleAnimate ? 'scale-105' : 'scale-100'} transition-all duration-700`}>
            <Sparkles className="w-6 h-6 text-white drop-shadow-md" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                {greeting}, Professor {userName || "Smith"}
              </h1>
              <span className="text-lg animate-bounce">👋</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-sm text-[#FFB255] font-semibold">Course File Generator</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-white py-1.5 px-3.5 rounded-full shadow-sm border border-orange-100 hover:border-orange-200 transition-all">
                <Clock className="w-3 h-3 text-orange-400" />
                <span>{currentTime}</span>
                <span className="text-gray-400">•</span>
                <span>{currentDate}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center bg-white rounded-full px-4 py-2.5 shadow-md border border-orange-100 hover:bg-orange-50 transition-all cursor-pointer group">
            <Coffee className="w-4 h-4 text-[#FFB255] mr-2 group-hover:text-orange-500 transition-colors group-hover:rotate-12 transform duration-300" />
            <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Academic Support</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-500 overflow-hidden relative z-10 ${isExpanded ? 'max-h-[900px]' : 'max-h-20'}`}>
        <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-xl p-5 md:p-6 mb-6 shadow-md border border-orange-100 transform hover:scale-[1.01] transition-transform duration-300">
          <p className="text-gray-700 leading-relaxed font-serif text-base">
            Welcome to your <span className="font-semibold text-[#FFB255]">Course File Generator</span> dashboard! This tool streamlines the process of creating course files by leveraging <span className="bg-gradient-to-br from-orange-100 to-amber-50 px-2 py-0.5 rounded text-orange-600">AI technology</span> to extract information from your course handouts.
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6 border-l-4 border-[#FFB255] relative overflow-hidden transform hover:translate-y-[-2px] transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-orange-100 to-transparent opacity-60 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-20 w-20 h-20 bg-gradient-to-tr from-amber-100 to-transparent opacity-40 rounded-tr-full"></div>
          
          <div className="flex items-center gap-3 mb-5 relative">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-[#FFB255]" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">How It Works</h2>
          </div>
          
          <div className="space-y-4 relative">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 bg-gradient-to-br from-orange-200 to-orange-100 w-8 h-8 flex items-center justify-center rounded-full shadow-md transform hover:rotate-3 hover:scale-110 transition-all duration-300">
                <span className="font-bold text-[#FFB255] text-sm">1</span>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-white rounded-xl p-4 flex-grow shadow-sm hover:shadow-md transition-all border border-orange-100 group">
                <div className="flex items-center gap-2 mb-1.5">
                  <Upload className="w-4 h-4 text-orange-500 group-hover:translate-y-[-2px] transform transition-transform duration-300" />
                  <h3 className="font-semibold text-gray-800 text-base">Upload Your Course Handout</h3>
                </div>
                <p className="text-gray-700 mt-1 text-sm leading-relaxed">
                  Upload your existing course handout document in PDF or DOCX format. 
                  The system supports various file types from standard university templates.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 bg-gradient-to-br from-amber-200 to-amber-100 w-8 h-8 flex items-center justify-center rounded-full shadow-md transform hover:rotate-3 hover:scale-110 transition-all duration-300">
                <span className="font-bold text-amber-600 text-sm">2</span>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-white rounded-xl p-4 flex-grow shadow-sm hover:shadow-md transition-all border border-amber-100 group">
                <div className="flex items-center gap-2 mb-1.5">
                  <FileText className="w-4 h-4 text-amber-600 group-hover:translate-y-[-2px] transform transition-transform duration-300" />
                  <h3 className="font-semibold text-gray-800 text-base">AI Extraction & Analysis</h3>
                </div>
                <p className="text-gray-700 mt-1 text-sm leading-relaxed">
                  Our AI will analyze your handout and automatically extract relevant academic information to 
                  pre-fill your course file. This process typically takes just a few moments.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 bg-gradient-to-br from-yellow-200 to-yellow-100 w-8 h-8 flex items-center justify-center rounded-full shadow-md transform hover:rotate-3 hover:scale-110 transition-all duration-300">
                <span className="font-bold text-yellow-600 text-sm">3</span>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-white rounded-xl p-4 flex-grow shadow-sm hover:shadow-md transition-all border border-yellow-100 group">
                <div className="flex items-center gap-2 mb-1.5">
                  <Eye className="w-4 h-4 text-yellow-600 group-hover:translate-y-[-2px] transform transition-transform duration-300" />
                  <h3 className="font-semibold text-gray-800 text-base">Review & Editing</h3>
                </div>
                <p className="text-gray-700 mt-1 text-sm leading-relaxed">
                  Click the "View File" button to review the generated course file. You can edit any field 
                  as needed to ensure accuracy and completeness of materials.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 bg-gradient-to-br from-green-200 to-green-100 w-8 h-8 flex items-center justify-center rounded-full shadow-md transform hover:rotate-3 hover:scale-110 transition-all duration-300">
                <span className="font-bold text-green-600 text-sm">4</span>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-white rounded-xl p-4 flex-grow shadow-sm hover:shadow-md transition-all border border-green-100 group">
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle className="w-4 h-4 text-green-600 group-hover:translate-y-[-2px] transform transition-transform duration-300" />
                  <h3 className="font-semibold text-gray-800 text-base">Verification & Finalization</h3>
                </div>
                <p className="text-gray-700 mt-1 text-sm leading-relaxed">
                  Verify that all information is correct, make any necessary adjustments, 
                  and finalize your course file for departmental submission or student distribution.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-50 to-white rounded-xl p-5 border border-orange-200 shadow-md transform hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0 bg-white p-2 rounded-full shadow-md group-hover:rotate-12 transform transition-all duration-300">
              <Info className="w-4 h-4 text-[#FFB255]" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">Pro Tip</h4>
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
      <div className="flex justify-center mt-6 relative z-10">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-[#FFB255] hover:text-orange-600 font-medium transition-all duration-300 
                    bg-white py-2.5 px-5 rounded-full shadow-md hover:shadow-lg border border-orange-200 text-sm group
                    hover:bg-orange-50"
        >
          {isExpanded ? (
            <>
              <span>Show Less</span> <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300" />
            </>
          ) : (
            <>
              <span>Read More</span> <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform duration-300" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WelcomeCard;