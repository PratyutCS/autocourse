import React, { useState, useEffect } from 'react';

const CourseCodeInput = ({ value, onChange }) => {
  const [error, setError] = useState("");

  // Validate the course code whenever it changes
  useEffect(() => {
    validateCourseCode(value);
  }, [value]);

  const validateCourseCode = (code) => {
    // Reset error if empty
    if (!code || code.length === 0) {
      setError("");
      return true;
    }

    // Check length
    if (code.length !== 7) {
      setError("Course code must be exactly 7 characters");
      return false;
    }

    // Validate first three characters (must be letters)
    const firstThree = code.substring(0, 3);
    const isFirstThreeAlpha = /^[a-zA-Z]+$/.test(firstThree);
    
    // Validate last four characters (must be numbers)
    const lastFour = code.substring(3);
    const isLastFourNumeric = /^[0-9]+$/.test(lastFour);

    if (!isFirstThreeAlpha) {
      setError("First 3 characters must be letters");
      return false;
    } else if (!isLastFourNumeric) {
      setError("Last 4 characters must be numbers");
      return false;
    } else {
      setError("");
      return true;
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Auto-format: first three characters to uppercase
    if (value.length <= 3) {
      value = value.toUpperCase();
    } else {
      value = value.substring(0, 3).toUpperCase() + value.substring(3);
    }
    
    onChange(value);
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        className={`w-full p-3 border ${error ? 'border-red-400' : 'border-gray-200'} rounded-md transition-all text-gray-700`}
        placeholder="Enter course code (e.g., CSC1234)"
        value={value}
        onChange={handleChange}
        maxLength={7}
      />
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      <p className="text-gray-500 text-xs">
        Format: 3 letters followed by 4 numbers (e.g., CSC1234)
      </p>
    </div>
  );
};

export default CourseCodeInput;