import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const COAttainmentAnalysis = ({ coWeightages, studentData, coAttainmentCriteria, copoMappingData }) => {
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [averages, setAverages] = useState({});
  const [attainmentSummary, setAttainmentSummary] = useState({
    weights: {},
    studentsScored3: {},
    percentageScored3: {},
    attainmentLevel: {},
    overallAttainment: 0
  });

  useEffect(() => {
    if (coWeightages && studentData && coAttainmentCriteria) {
      calculateAttainment();
    }
  }, [coWeightages, studentData, coAttainmentCriteria]);

  const calculateAverages = (performanceData) => {
    const cos = Object.keys(coWeightages);
    const avgScores = {};
    const summary = {
      weights: {},
      studentsScored3: {},
      percentageScored3: {},
      attainmentLevel: {},
      overallAttainment: 0
    };

    cos.forEach(co => {
      const scores = performanceData.map(student => student.coScores[co]);
      const sum = scores.reduce((acc, score) => acc + score, 0);
      avgScores[co] = (sum / performanceData.length).toFixed(2);

      // Calculate summary data
      summary.weights[co] = '33%'; // You may want to make this dynamic
      const scored3Count = scores.filter(score => score >= 3).length;
      summary.studentsScored3[co] = scored3Count;
      summary.percentageScored3[co] = `${((scored3Count / performanceData.length) * 100).toFixed(0)}%`;
      summary.attainmentLevel[co] = 3; // This should be calculated based on your criteria
    });

    // Calculate overall attainment
    summary.overallAttainment = Math.round(
      Object.values(summary.attainmentLevel).reduce((acc, val) => acc + val, 0) / 
      Object.keys(summary.attainmentLevel).length
    );

    setAverages(avgScores);
    setAttainmentSummary(summary);
  };

  const calculateAttainment = () => {
    const performanceData = [];
    const cos = Object.keys(coWeightages);

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
            const coWeight = parseFloat(coWeightages[co][component.toLowerCase()] || 0);

            weightedScore += (studentScore * (coWeight / 100));
            totalWeight += (maxMark * (coWeight / 100));
          });

          const partial = coAttainmentCriteria?.[co]?.partial || 0;
          const full = coAttainmentCriteria?.[co]?.full || 0;
          let percentage = totalWeight > 0 ? ((weightedScore / totalWeight) * 100).toFixed(2) : 0;

          studentResult.coScores[co] = percentage >= full ? 3 : 
                                     percentage >= partial ? 2 : 1;
        });

        performanceData.push(studentResult);
      });
    }

    setStudentPerformance(performanceData);
    calculateAverages(performanceData);
  };

  if (!coWeightages || !studentData || !coAttainmentCriteria || !copoMappingData) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            20
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            CO Attainment Analysis
          </h2>
        </div>

        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg">
            Missing Required Data
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please ensure CO weightages, student data, CO PO Mapping Data and attainment criteria are provided
          </p>
        </div>
      </div>
    );
  }

  const totalColumns = Object.keys(coWeightages).length + 1; // +1 for the NAME column
  const totalRows = studentPerformance.length;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
          20
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          CO Attainment Analysis
        </h2>
      </div>

      <div className="space-y-8">
        {/* Attainment Summary Table */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">CO Attainment Summary</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Outcomes
                  </th>
                  {Object.keys(coWeightages).map(co => (
                    <th key={co} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {co}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Weights Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Weights
                  </td>
                  {Object.keys(coWeightages).map(co => (
                    <td key={`weight_${co}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {attainmentSummary.weights[co]}
                    </td>
                  ))}
                </tr>
                {/* Students Scored >=3 Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    No. of students scored greater than 3
                  </td>
                  {Object.keys(coWeightages).map(co => (
                    <td key={`scored3_${co}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {attainmentSummary.studentsScored3[co]}
                    </td>
                  ))}
                </tr>
                {/* Percentage Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    % age of students scored greater than 3
                  </td>
                  {Object.keys(coWeightages).map(co => (
                    <td key={`percentage_${co}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {attainmentSummary.percentageScored3[co]}
                    </td>
                  ))}
                </tr>
                {/* Attainment Level Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Attainment Level
                  </td>
                  {Object.keys(coWeightages).map(co => (
                    <td key={`attainment_${co}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {attainmentSummary.attainmentLevel[co]}
                    </td>
                  ))}
                </tr>
                {/* Overall Course Attainment Row */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Overall Course Attainment
                  </td>
                  <td colSpan={Object.keys(coWeightages).length} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                    {attainmentSummary.overallAttainment}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Individual Student Performance Table */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student-wise CO Achievement</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NAME
                  </th>
                  {Object.keys(coWeightages).map(co => (
                    <th key={co} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {co} Score
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentPerformance.slice(0, 5).map(student => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.rollNumber}
                    </td>
                    {Object.keys(coWeightages).map(co => (
                      <td key={`${student.id}_${co}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.coScores[co]}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Average Row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Average
                  </td>
                  {Object.keys(coWeightages).map(co => (
                    <td key={`average_${co}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {averages[co]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            {/* Centered Statistics */}
            <div className="mt-4 text-sm text-gray-500 border-t pt-2 text-center mx-auto w-fit">
              Total Rows: {totalRows} | Total Columns: {totalColumns}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default COAttainmentAnalysis;