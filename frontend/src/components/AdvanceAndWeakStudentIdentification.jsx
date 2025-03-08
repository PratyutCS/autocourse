import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const AdvanceAndWeakStudentIdentification = ({
  coWeightages,
  studentData,
  coAttainmentCriteria
}) => {
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [averages, setAverages] = useState({});
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

          // Calculate the row average for the student
          const coScoreValues = Object.values(studentResult.coScores);
          const rowAverage = coScoreValues.length > 0 
            ? (coScoreValues.reduce((sum, score) => sum + score, 0) / coScoreValues.length)
            : 0;
          studentResult.rowAverage = parseFloat(rowAverage.toFixed(2));

          performanceData.push(studentResult);
        });
      }

      // Sort by rowAverage descending (highest average first)
      performanceData.sort((a, b) => b.rowAverage - a.rowAverage);

      setStudentPerformance(performanceData);
      calculateAverages(performanceData);
    } catch (err) {
      console.error("Error in calculateStudentAchievement:", err);
      setError("Failed to calculate student achievement data");
      setStudentPerformance([]);
      setAverages({});
    } finally {
      setLoading(false);
    }
  };

  const calculateAverages = (performanceData) => {
    const cos = Object.keys(coWeightages || {});
    const avgScores = {};

    try {
      cos.forEach(co => {
        const scores = performanceData.map(student => student.coScores[co]);
        const sum = scores.reduce((acc, score) => acc + score, 0);
        avgScores[co] = performanceData.length > 0 
          ? (sum / performanceData.length).toFixed(2)
          : "0.00";
      });
      
      // Calculate overall average of student row averages.
      const totalRowAverage = performanceData.reduce((sum, student) => sum + student.rowAverage, 0);
      avgScores.rowAverage = performanceData.length > 0 
          ? (totalRowAverage / performanceData.length).toFixed(2)
          : "0.00";

      setAverages(avgScores);
    } catch (err) {
      console.error("Error in calculateAverages:", err);
      setAverages({});
    }
  };

  if (!coWeightages || !studentData || !coAttainmentCriteria) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Student-wise CO Achievement
          </h2>
        </div>

        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg">
            Missing Required Data
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please ensure CO weightages, student data, and attainment criteria are provided
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Student-wise CO Achievement</h2>
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Student-wise CO Achievement</h2>
        <div className="text-center py-10 text-red-500">{error}</div>
      </div>
    );
  }

  // Include an extra column for the student row average.
  const totalColumns = Object.keys(coWeightages).length + 2; // NAME + CO score columns + Row Average
  const totalRows = studentPerformance.length;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Student-wise CO Achievement</h2>
      
      {studentPerformance.length > 0 ? (
        <div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NAME
                  </th>
                  {Object.keys(coWeightages || {}).map(co => (
                    <th
                      key={co}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {co} Score
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentPerformance.map(student => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.rollNumber}
                    </td>
                    {Object.keys(coWeightages || {}).map(co => (
                      <td
                        key={`${student.id}_${co}`}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {student.coScores[co]}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.rowAverage}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Overall Average
                  </td>
                  {Object.keys(coWeightages || {}).map(co => (
                    <td
                      key={`average_${co}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {averages[co] || "0.00"}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {averages.rowAverage || "0.00"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-500 pt-2 text-center mx-auto w-fit">
            Total Rows: {totalRows} | Total Columns: {totalColumns}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-600">No student data available</p>
        </div>
      )}
    </div>
  );
};

export default AdvanceAndWeakStudentIdentification;