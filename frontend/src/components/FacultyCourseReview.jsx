import React, { useState, useEffect } from "react";

const FacultyCourseReview = ({ initialData, onSave }) => {
  const [reviewText, setReviewText] = useState(initialData || "");

  useEffect(() => {
    if (initialData) {
      setReviewText(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setReviewText(newValue);
    if (onSave) {
      onSave(newValue);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
          24
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Faculty Course Review
        </h2>
      </div>
      <div className="space-y-3">
        <p className="text-gray-600 text-sm">
          Provide details on: Use of Innovative Pedagogies, Technology, Experiential Learning, 
          Integration with the Vision and Mission of the University, Feedback, Course Outcome 
          attainment for the next run of the course, etc.
        </p>
        <textarea
          className="w-full p-4 border border-gray-200 rounded-md transition-all min-h-[250px] text-gray-700 focus:border-[#FFB255] focus:ring focus:ring-orange-100 focus:outline-none"
          placeholder="Enter your course review here..."
          value={reviewText}
          onChange={handleChange}
          rows="8"
        />
      </div>
    </div>
  );
};

export default FacultyCourseReview;