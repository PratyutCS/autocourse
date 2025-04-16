import React from "react";
import { FaChartBar } from "react-icons/fa"; // You can swap icon as needed

const StudentDataAnalysis = ({ studentData }) => {
  if (!studentData || !studentData.data || studentData.data.length === 0) {
    return <div className="text-gray-600">No student data available</div>;
  }

  const totalMarksKey = Object.keys(studentData.maxMarks).at(-1);
  const totalMarks = studentData.data.map((student) =>
    parseFloat(student[totalMarksKey]) || 0
  );

  const maxMarks = Math.max(...totalMarks);
  const minMarks = Math.min(...totalMarks);
  const avgMarks =
    totalMarks.reduce((sum, marks) => sum + marks, 0) / totalMarks.length;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
      <div className="flex items-center space-x-2 mb-4">
        <FaChartBar className="text-orange-500" />
        <h2 className="text-lg font-semibold text-gray-800">
          {totalMarksKey} Statistics
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Min */}
        <div className="bg-white border border-yellow-200 rounded-md p-4">
          <div className="text-sm text-gray-600">Minimum</div>
          <div className="text-lg font-bold text-gray-900">{minMarks}</div>
        </div>

        {/* Max */}
        <div className="bg-white border border-yellow-200 rounded-md p-4">
          <div className="text-sm text-gray-600">Maximum</div>
          <div className="text-lg font-bold text-gray-900">{maxMarks}</div>
        </div>

        {/* Avg */}
        <div className="bg-white border border-yellow-200 rounded-md p-4">
          <div className="text-sm text-gray-600">Average</div>
          <div className="text-lg font-bold text-gray-900">{avgMarks.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default StudentDataAnalysis;
