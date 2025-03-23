import React, { useState, useEffect } from 'react';

const StudentCOAchievement = ({ selectedAssessments, coWeightages, studentData, coAttainmentCriteria }) => {
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [averages, setAverages] = useState({});

  // Get only the COs that are affected by the selected assessments.
  const getRelevantCOs = () => {
    if (!coWeightages || !selectedAssessments) return [];
    return Object.keys(coWeightages).filter(co => 
      selectedAssessments.some(assessment => parseFloat(coWeightages[co]?.[assessment.toLowerCase()] || 0) > 0)
    );
  };

  // Calculate averages for each relevant CO across all students for display in the average row
  const calculateAverages = (performanceData) => {
    const relevantCOs = getRelevantCOs();
    const avgScores = {};

    try {
      relevantCOs.forEach(co => {
        const scores = performanceData.map(student => student.coScores[co]);
        const sum = scores.reduce((acc, score) => acc + score, 0);
        avgScores[co] = performanceData.length > 0 ? parseFloat((sum / performanceData.length).toFixed(2)) : "0.00";
      });
      setAverages(avgScores);
    } catch (error) {
      console.error("Error in calculateAverages:", error);
      setAverages({});
    }
  };

  // Calculate the attainment for each student based on studentData and coAttainmentCriteria
  // using only the selected assessments and the relevant COs they affect.
  const calculateAttainment = () => {
    try {
      const performanceData = [];
      const relevantCOs = getRelevantCOs();

      if (studentData?.maxMarks && studentData?.data) {
        // Only include assessments that are selected
        const assessmentComponents = Object.entries(studentData.maxMarks)
          .filter(([component]) => selectedAssessments.includes(component));

        studentData.data.forEach((student, index) => {
          const studentResult = {
            id: student["Unique Id."],
            rollNumber: student["Student Name"] || `Student ${index + 1}`,
            coScores: {}
          };

          relevantCOs.forEach(co => {
            let weightedScore = 0;
            let totalWeight = 0;
            assessmentComponents.forEach(([component, maxMark]) => {
              const studentScore = student[component] || 0;
              const coWeight = parseFloat(coWeightages[co]?.[component.toLowerCase()] || 0);
              weightedScore += studentScore * (coWeight / 100);
              totalWeight += maxMark * (coWeight / 100);
            });

            const partial = parseFloat(coAttainmentCriteria?.[co]?.partial || 0);
            const full = parseFloat(coAttainmentCriteria?.[co]?.full || 0);
            const percentage = totalWeight > 0 ? ((weightedScore / totalWeight) * 100) : 0;

            if (percentage >= full) {
              studentResult.coScores[co] = 3;
            } else if (percentage >= partial && percentage < full) {
              studentResult.coScores[co] = 2;
            } else {
              studentResult.coScores[co] = 1;
            }
          });

          performanceData.push(studentResult);
        });
      }

      setStudentPerformance(performanceData);
      calculateAverages(performanceData);
    } catch (error) {
      console.error("Error in calculateAttainment:", error);
      setStudentPerformance([]);
      setAverages({});
    }
  };

  useEffect(() => {
    if (coWeightages && studentData && coAttainmentCriteria && selectedAssessments) {
      calculateAttainment();
    }
  }, [coWeightages, studentData, coAttainmentCriteria, selectedAssessments]);

  // Get the relevant COs to display in the table
  const relevantCOs = getRelevantCOs();

  return (
    <div className="rounded-lg p-4 shadow-md border border-black border-opacity-10">
      <h3 className="text-lg font-semibold text-purple-700 mb-4 border-b pb-2">Student-wise CO Achievement</h3>
      {studentPerformance.length > 0 && relevantCOs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-md">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-purple-700 border-b-2 border-gray-200 border-opacity-10">NAME</th>
                {relevantCOs.map(co => (
                  <th key={co} className="px-4 py-2 text-center text-sm font-medium text-purple-700 border-b-2 border-gray-200 border-opacity-10">
                    {co} Score
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {studentPerformance.map(student => (
                <tr key={student.id} className="hover:bg-purple-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200 border-opacity-10">
                    {student.rollNumber}
                  </td>
                  {relevantCOs.map(co => (
                    <td key={co} className="px-4 py-2 text-center text-sm text-gray-600 border-b border-gray-200 border-opacity-10">
                      {student.coScores[co]}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="hover:bg-purple-100">
                <td className="px-4 py-2 text-sm font-bold text-purple-700 border-b border-gray-200 border-opacity-10">Average</td>
                {relevantCOs.map(co => (
                  <td key={co} className="px-4 py-2 text-center text-sm font-bold text-purple-700 border-b border-gray-200 border-opacity-10">
                    {averages[co] || "0.00"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p>No student performance data available or no relevant COs.</p>
      )}
    </div>
  );
};

export default StudentCOAchievement;