import React, { useState, useEffect } from 'react';

const AssessmentSelection = ({ studentData, selectedAssessments, onChange }) => {
  const [selected, setSelected] = useState(selectedAssessments || []);

  useEffect(() => {
    // Update local state when props change
    setSelected(selectedAssessments || []);
  }, [selectedAssessments]);

  if (!studentData || !studentData.maxMarks) {
    return <div className="text-gray-500 italic">Please upload student data to see assessments</div>;
  }

  let assessments = Object.keys(studentData.maxMarks);
  assessments = assessments.slice(0, -1);

  const toggleAssessment = (assessment) => {
    const newSelected = selected.includes(assessment)
      ? selected.filter(item => item !== assessment)
      : [...selected, assessment];
    
    setSelected(newSelected);
    onChange(newSelected);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {assessments.map(assessment => (
          <button
            key={assessment}
            className={`py-2 px-4 rounded-md border transition-colors ${
              selected.includes(assessment)
                ? 'bg-[#FFB255] text-white border-[#FFB255]'
                : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
            }`}
            onClick={() => toggleAssessment(assessment)}
          >
            {assessment} ({studentData.maxMarks[assessment]})
          </button>
        ))}
      </div>
      
      
        {/* <h3 className="font-medium text-gray-700 mb-2">Selected Assessments ({selected.length})</h3> */}
        {selected.length > 0 ? (
          <div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No assessments selected</p>
        )}
      
    </div>
  );
};

export default AssessmentSelection;