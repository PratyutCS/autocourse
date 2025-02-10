import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const WelcomeCard = ({ userName }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-white to-orange-50 rounded-lg shadow-md p-6 border border-gray-100 transform hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-orange-400 to-[#FFB255] p-2 rounded-lg shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Welcome, {userName || "User"}! 👋
            </h1>
          </div>
        </div>
      </div>

      <div className={`mt-4 transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[500px]' : 'max-h-20'}`}>
        <p className="text-gray-600 leading-relaxed">
          Welcome to your personalized dashboard! Here you can generate and manage your course files with ease. 
          Our intuitive interface allows you to upload handouts, organize your materials, and access everything you need in one place.
          <br /><br />
          We've designed this space to make your course management as smooth as possible. You can:
          <br /><br />
          • Upload and manage course handouts effortlessly<br />
          • Generate comprehensive course files automatically<br />
          • Keep track of all your materials in one organized space<br />
          • Access your documents anywhere, anytime
        </p>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 flex items-center gap-2 text-[#FFB255] hover:text-orange-500 font-medium transition-colors duration-200"
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