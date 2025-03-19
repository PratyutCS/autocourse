import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const InstructionsCard = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('instructions');

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-xl">
      {/* Header with gradient border effect */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFB255] to-orange-300"></div>
        
        <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-orange-50 p-2 rounded-lg">
              <AlertCircle className="h-5 w-5 text-[#FFB255]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Important Instructions
            </h3>
          </div>
          <button 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? 
              <ChevronUp className="h-4 w-4 text-gray-500" /> : 
              <ChevronDown className="h-4 w-4 text-gray-500" />
            }
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'instructions' 
                  ? 'text-[#FFB255] border-b-2 border-[#FFB255]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('instructions')}
            >
              Instructions
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'tips' 
                  ? 'text-[#FFB255] border-b-2 border-[#FFB255]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tips')}
            >
              Pro Tips
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'instructions' && (
              <div className="space-y-3 text-gray-600">
                <div className="flex items-start space-x-3 p-2 hover:bg-orange-50 rounded-lg transition-colors">
                  <CheckCircle className="h-5 w-5 text-[#FFB255] mt-0.5 flex-shrink-0" />
                  <p>All fields in this form are editable and can be modified as needed.</p>
                </div>
                
                <div className="flex items-start space-x-3 p-2 hover:bg-orange-50 rounded-lg transition-colors">
                  <Info className="h-5 w-5 text-[#FFB255] mt-0.5 flex-shrink-0" />
                  <p>The initial data has been automatically extracted from your course handout using AI.</p>
                </div>
                
                <div className="flex items-start space-x-3 p-2 hover:bg-orange-50 rounded-lg transition-colors">
                  <AlertTriangle className="h-5 w-5 text-[#FFB255] mt-0.5 flex-shrink-0" />
                  <p>Please review all information carefully as AI-extracted data may not be 100% accurate.</p>
                </div>
                
                <div className="flex items-start space-x-3 p-2 hover:bg-orange-50 rounded-lg transition-colors">
                  <CheckCircle className="h-5 w-5 text-[#FFB255] mt-0.5 flex-shrink-0" />
                  <p>You can save your progress at any time using the Submit Form button.</p>
                </div>
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                  <h4 className="font-medium text-orange-800 mb-2">Verification Tips</h4>
                  <ul className="space-y-2 text-orange-700 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>Take your time to verify each section, especially numerical data and dates, before final submission.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>Double-check all course codes and credit hours to ensure they match your syllabus exactly.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>Consider reviewing all deadlines and assessment weightages with particular attention.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructionsCard;