import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const COAttainmentAnalysis = ({
  coWeightages,
  studentData,
  coAttainmentCriteria,
  copoMappingData,
  targetAttainment
}) => {
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [averages, setAverages] = useState({});
  const [programAttainment, setProgramAttainment] = useState({});
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
  }, [coWeightages, studentData, coAttainmentCriteria, targetAttainment]);

  useEffect(() => {
    if (copoMappingData && Object.keys(averages).length > 0) {
      calculateProgramAttainment();
    }
  }, [copoMappingData, averages]);

  const calculateProgramAttainment = () => {
    const programAttainments = {};
    const weightSums = {};

    // Initialize data structures and calculate weighted averages per PO
    Object.keys(copoMappingData.mappingData).forEach(co => {
      Object.keys(copoMappingData.mappingData[co]).forEach(po => {
        if (!programAttainments[po]) {
          programAttainments[po] = 0;
          weightSums[po] = 0;
        }
        const mappingValue = parseFloat(copoMappingData.mappingData[co][po]) || 0;
        const coAverage = parseFloat(averages[co]) || 0;
        programAttainments[po] += mappingValue * coAverage;
        weightSums[po] += mappingValue;
      });
    });

    Object.keys(programAttainments).forEach(po => {
      if (weightSums[po] > 0) {
        programAttainments[po] = (programAttainments[po] / weightSums[po]).toFixed(2);
      } else {
        programAttainments[po] = "0.00";
      }
    });

    setProgramAttainment(programAttainments);
  };

  const calculateCoWeights = () => {
    const cos = Object.keys(coWeightages || {});
    const weights = {};

    if (!studentData || !studentData.maxMarks) {
      cos.forEach(co => {
        weights[co] = "0.00%";
      });
      return weights;
    }

    const assessmentComponents = Object.entries(studentData.maxMarks).slice(0, -1);
    const totalMaxMarks = assessmentComponents.reduce((sum, [_, maxMark]) => sum + parseFloat(maxMark || 0), 0);

    cos.forEach(co => {
      let coWeightedSum = 0;

      assessmentComponents.forEach(([component, maxMark]) => {
        const coWeight = parseFloat(coWeightages[co]?.[component.toLowerCase()] || 0);
        coWeightedSum += parseFloat(maxMark) * (coWeight / 100);
      });

      const weightPercentage = totalMaxMarks > 0 ? (coWeightedSum / totalMaxMarks) * 100 : 0;
      weights[co] = `${weightPercentage.toFixed(2)}%`;
    });

    return weights;
  };

  const calculateAverages = (performanceData) => {
    const cos = Object.keys(coWeightages || {});
    const avgScores = {};
    const summary = {
      weights: {},
      studentsScored3: {},
      percentageScored3: {},
      attainmentLevel: {},
      overallAttainment: 0
    };

    try {
      summary.weights = calculateCoWeights();

      cos.forEach(co => {
        const scores = performanceData.map(student => student.coScores[co]);
        const sum = scores.reduce((acc, score) => acc + score, 0);
        avgScores[co] = performanceData.length > 0 ? (sum / performanceData.length).toFixed(2) : "0.00";

        const scored3Count = scores.filter(score => score >= 3).length;
        summary.studentsScored3[co] = scored3Count;

        // Calculate the percentage of students scoring ≥ 3
        const percentageScored3 = performanceData.length > 0 ? (scored3Count / performanceData.length) * 100 : 0;
        summary.percentageScored3[co] = `${percentageScored3.toFixed(2)}%`;

        if (targetAttainment && targetAttainment[co]) {
          const { full, partial } = targetAttainment[co];
          if (percentageScored3 >= parseFloat(full)) {
            summary.attainmentLevel[co] = 3;
          } else if (percentageScored3 >= parseFloat(partial)) {
            summary.attainmentLevel[co] = 2;
          } else {
            summary.attainmentLevel[co] = 1;
          }
        } else {
          summary.attainmentLevel[co] = 1;
        }
      });

      const attainmentValues = Object.values(summary.attainmentLevel);
      summary.overallAttainment =
        attainmentValues.length > 0
          ? parseFloat((attainmentValues.reduce((acc, val) => acc + val, 0) / attainmentValues.length).toFixed(4))
          : 0;

      setAverages(avgScores);
      setAttainmentSummary(summary);
    } catch (error) {
      console.error("Error in calculateAverages:", error);
      setAverages({});
      setAttainmentSummary(summary);
    }
  };

  const calculateAttainment = () => {
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
              weightedScore += studentScore * (coWeight / 100);
              totalWeight += maxMark * (coWeight / 100);
            });

            const partial = parseFloat(coAttainmentCriteria?.[co]?.partial || 0);
            const full = parseFloat(coAttainmentCriteria?.[co]?.full || 0);
            const percentage = totalWeight > 0 ? ((weightedScore / totalWeight) * 100).toFixed(2) : 0;

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

  if (!coWeightages || !studentData || !coAttainmentCriteria || !copoMappingData) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            12
          </div>
          <h2 className="text-xl font-semibold text-gray-800">CO Attainment Analysis</h2>
        </div>
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg">Missing Required Data</p>
          <p className="text-sm text-gray-500 mt-2">
            Please ensure CO weightages, student data, CO PO Mapping Data and attainment criteria are provided.
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const coLabels = Object.keys(averages);
  
  // Course Attainment Chart (using averages)
  const courseAttainmentChartData = {
    labels: coLabels,
    datasets: [
      {
        label: "Attainment",
        data: coLabels.map(co => parseFloat(averages[co]) || 0),
        backgroundColor: 'rgba(49, 85, 163, 0.6)'
      },
      {
        label: "Required",
        data: coLabels.map(() => 3),
        backgroundColor: 'rgba(237, 125, 49, 0.6)'
      }
    ]
  };
  const courseAttainmentChartOptions = {
    indexAxis: 'y',
    scales: {
      x: { beginAtZero: true, max: 3 }
    }
  };

  // Percentage Chart (using % of students scoring ≥ 3)
  const percentageLabels = Object.keys(attainmentSummary.percentageScored3);
  const percentageDataValues = percentageLabels.map(co => {
    const val = attainmentSummary.percentageScored3[co] || "0%";
    return parseFloat(val.replace("%", ""));
  });
  const percentageChartData = {
    labels: percentageLabels,
    datasets: [
      {
        label: "% of Students ≥ 3",
        data: percentageDataValues,
        backgroundColor: 'rgba(49, 85, 163, 0.6)'
      }
    ]
  };
  const percentageChartOptions = {
    indexAxis: 'y',
    scales: {
      x: { beginAtZero: true, max: 100 }
    }
  };

  const poLabels = Object.keys(programAttainment);
  const programAttainmentData = {
    labels: poLabels,
    datasets: [
      {
        label: "Program Attainment",
        data: poLabels.map(po => parseFloat(programAttainment[po]) || 0),
        backgroundColor: 'rgba(49, 85, 163, 0.6)'
      }
    ]
  };
  const programAttainmentChartOptions = {
    indexAxis: 'y',
    scales: { x: { beginAtZero: true } }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
          12
        </div>
        <h2 className="text-xl font-semibold text-gray-800">CO Attainment Analysis</h2>
      </div>

      {/* Pair 1: CO Attainment Summary Table paired with % of Students Scored ≥ 3 Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">CO Attainment Summary</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b border-gray-200 p-4 text-sm font-semibold text-gray-600 text-left">Course Outcomes</th>
                {Object.keys(coWeightages || {}).map(co => (
                  <th key={co} className="border-b border-gray-200 p-4 text-sm font-semibold text-gray-600 text-center">
                    {co}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 transition-colors">
                <td className="p-4 text-gray-700 font-medium">Weights</td>
                {Object.keys(coWeightages || {}).map(co => (
                  <td key={`weight_${co}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {attainmentSummary.weights[co] || "0.00%"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap text-sm font-medium text-gray-900">No. of students scored ≥ 3</td>
                {Object.keys(coWeightages || {}).map(co => (
                  <td key={`scored3_${co}`} className="px-6 py-4 border-b border-gray-200 whitespace-nowrap text-sm text-gray-500 text-center">
                    {attainmentSummary.studentsScored3[co] || 0}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-sm font-medium text-gray-900">Percentage of students scored ≥ 3</td>
                {Object.keys(coWeightages || {}).map(co => (
                  <td key={`percentage_${co}`} className="border-b border-gray-200 px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {attainmentSummary.percentageScored3[co] || "0%"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-b border-gray-200 px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Attainment Level</td>
                {Object.keys(coWeightages || {}).map(co => (
                  <td key={`attainment_${co}`} className="border-b border-gray-200 px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {attainmentSummary.attainmentLevel[co] || 0}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Overall Course Attainment</td>
                <td colSpan={Object.keys(coWeightages || {}).length} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                  {attainmentSummary.overallAttainment?.toFixed(4) || "0.0000"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ maxWidth: '40vw', margin: '0 auto' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">% of Students Scored ≥ 3</h3>
          <Bar data={percentageChartData} options={percentageChartOptions} />
        </div>
      </div>

      {/* Pair 2: Program Attainment Table and Chart */}
      {Object.keys(programAttainment).length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Program Attainment</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
            <table className="w-full divide-y border-collapse divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program Outcomes</th>
                  {Object.keys(programAttainment).map(po => (
                    <th key={po} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {po}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Program Attainment</td>
                  {Object.keys(programAttainment).map(po => (
                    <td key={`pa_${po}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {programAttainment[po]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ maxWidth: '40vw', margin: '0 auto' }}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Program Attainment Chart</h3>
            <Bar data={programAttainmentData} options={programAttainmentChartOptions} />
          </div>
        </div>
      )}

      {/* Pair 3: Student-wise CO Achievement Table paired with Course Outcome Attainment Chart */}
      {studentPerformance.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student-wise CO Achievement</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
            <table className="w-full divide-y border-collapse divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                  {Object.keys(coWeightages || {}).map(co => (
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
                    {Object.keys(coWeightages || {}).map(co => (
                      <td key={`${student.id}_${co}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.coScores[co]}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Average</td>
                  {Object.keys(coWeightages || {}).map(co => (
                    <td key={`average_${co}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {averages[co] || "0.00"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ maxWidth: '40vw', margin: '0 auto' }}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Outcome Attainment</h3>
            <Bar data={courseAttainmentChartData} options={courseAttainmentChartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default COAttainmentAnalysis;