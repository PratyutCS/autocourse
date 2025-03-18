import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";

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
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <span className="font-semibold">Allocation Guidance:</span>
          <p>
           If applicable, including aspects such as the use of innovative pedagogies, technology integration, experiential learning, alignment with the university's vision and mission, and feedback for the next run of the course.
        </p>
        </div>
      </div>
        
        <textarea
          className="w-full p-4 border border-gray-200 rounded-md transition-all min-h-[20px] text-gray-700 focus:border-[#FFB255] focus:ring focus:ring-orange-100 focus:outline-none"
          placeholder="Enter your course review here..."
          value={reviewText}
          onChange={handleChange}
          rows="2"
        />
      </div>
    </div>
  );
};

export default FacultyCourseReview;