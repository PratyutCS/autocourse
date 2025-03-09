import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const AdvanceAndWeakStudentIdentification = ({
  coWeightages,
  studentData,
  coAttainmentCriteria
}) => {
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (coWeightages && studentData && coAttainmentCriteria) {
      calculateStudentAchievement();
    }
  }, [coWeightages, studentData, coAttainmentCriteria]);

  const calculateStudentAchievement = () => {
    setLoading(true);
    try {
      const performanceData = [];
      const cos = Object.keys(coWeightages || {});
      
      if (studentData?.maxMarks && studentData?.data) {
        const assessmentComponents = Object.entries(studentData.maxMarks).slice(0, -1);

        studentData.data.forEach((student, index) => {
          const studentResult = {
            id: student["Unique Id."],
            rollNumber: student["Student Name"] || `Student ${index + 1}`,
            coScores: {}
          };

          cos.forEach(co => {
            let weightedScore = 0;
            let totalWeight = 0;
            
            assessmentComponents.forEach(([component, maxMark]) => {
              const studentScore = student[component] || 0;
              const coWeight = parseFloat(coWeightages[co]?.[component.toLowerCase()] || 0);
              weightedScore += (studentScore * (coWeight / 100));
              totalWeight += (maxMark * (coWeight / 100));
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
          
          // Calculate the row average (calculation kept but not displayed)
          const coScoreValues = Object.values(studentResult.coScores);
          const rowAverage = coScoreValues.length > 0 
            ? (coScoreValues.reduce((sum, score) => sum + score, 0) / coScoreValues.length)
            : 0;
          studentResult.rowAverage = parseFloat(rowAverage.toFixed(2));
          
          performanceData.push(studentResult);
        });
      }
      
      // Sort by rowAverage descending
      performanceData.sort((a, b) => b.rowAverage - a.rowAverage);
      setStudentPerformance(performanceData);
    } catch (err) {
      console.error("Error in calculateStudentAchievement:", err);
      setError("Failed to calculate student achievement data");
      setStudentPerformance([]);
    } finally {
      setLoading(false);
    }
  };

  if (!coWeightages || !studentData || !coAttainmentCriteria) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center">
            12
          </div>
          <h2 className="section-title text-xl font-semibold text-gray-800">
            Advanced &amp; Weak Students
          </h2>
        </div>
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg">Missing Required Data</p>
          <p className="text-sm text-gray-500 mt-2">
            Please ensure CO weightages, student data, and attainment criteria are provided.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center">
            12
          </div>
          <h2 className="section-title text-xl font-semibold text-gray-800">
            Advanced &amp; Weak Students
          </h2>
        </div>
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center">
            12
          </div>
          <h2 className="section-title text-xl font-semibold text-gray-800">
            Advanced &amp; Weak Students
          </h2>
        </div>
        <div className="text-center py-10 text-red-500">{error}</div>
      </div>
    );
  }

  // Only display identified learners (advanced with all scores 3 or slow with all scores 1)
  const filteredPerformance = studentPerformance.filter(student => {
    const coScores = Object.values(student.coScores);
    return coScores.every(score => score === 3) || coScores.every(score => score === 1);
  });

  const totalColumns = Object.keys(coWeightages).length + 1; // Name column + CO scores columns

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center">
          12
        </div>
        <h2 className="section-title text-xl font-semibold text-gray-800">
          Advanced &amp; Weak Students
        </h2>
      </div>
      {filteredPerformance.length > 0 ? (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-left">NAME</th>
                  {Object.keys(coWeightages || {}).map(co => (
                    <th key={co} className="px-4 py-2 border-b text-left">{co} Score</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPerformance.map(student => {
                  const coScores = Object.values(student.coScores);
                  const isAdvancedLearner = coScores.every(score => score === 3);
                  const isSlowLearner = coScores.every(score => score === 1);
                  const rowClassName = isAdvancedLearner
                    ? "bg-green-100"
                    : isSlowLearner
                      ? "bg-yellow-100"
                      : "";
                  return (
                    <tr key={student.id} className={rowClassName}>
                      <td className="px-4 py-2 border-b">{student.rollNumber}</td>
                      {Object.keys(coWeightages || {}).map(co => (
                        <td key={`${student.id}_${co}`} className="px-4 py-2 border-b">
                          {student.coScores[co]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-600 text-center">
            Total Identified Learners: {filteredPerformance.length} | Total Columns: {totalColumns}
          </div>
          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-base font-semibold mb-2">Legend</h3>
            <ul className="list-disc pl-5 text-sm">
              <li className="flex items-center">
                <span className="inline-block w-4 h-4 mr-2 bg-green-100 border border-green-300 rounded"></span>
                <span className="text-green-700 font-medium">Advanced Learner</span> (all CO scores are 3)
              </li>
              <li className="flex items-center mt-1">
                <span className="inline-block w-4 h-4 mr-2 bg-yellow-100 border border-yellow-300 rounded"></span>
                <span className="text-yellow-700 font-medium">Slow Learner</span> (all CO scores are 1)
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No advanced or slow learners identified</p>
        </div>
      )}
    </div>
  );
};

export default AdvanceAndWeakStudentIdentification;