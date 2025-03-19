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
      <div className="bg-white rounded-lg shadow-md p-6 m-4 border-2 border-gray-300 border-opacity-10">
        <div className="flex items-center gap-4 mb-6">
            <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              13
            </div>
            <h2 className="section-title text-xl font-semibold">
              Course Attainment Analysis
            </h2>
          </div>
        <div className="border-2 border-gray-400 border-opacity-10 rounded-md p-4 flex items-start">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Missing Required Data</h3>
            <p className="text-sm text-red-700 mt-1">
              Please ensure CO weightages, student data, CO PO Mapping Data and attainment criteria are provided.
            </p>
          </div>
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
        backgroundColor: 'rgba(79, 70, 229, 0.7)'
      },
      {
        label: "Required",
        data: coLabels.map(() => 3),
        backgroundColor: 'rgba(245, 158, 11, 0.7)'
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
        backgroundColor: 'rgba(16, 185, 129, 0.7)'
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
        backgroundColor: 'rgba(239, 68, 68, 0.7)'
      }
    ]
  };
  const programAttainmentChartOptions = {
    indexAxis: 'y',
    scales: { x: { beginAtZero: true } }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-black/5 border-opacity-10">
      <div className="flex items-center gap-4 mb-6">
            <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              14
            </div>
            <h2 className="section-title text-xl font-semibold">
              Course Attainment Analysis
            </h2>
          </div>
      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CO Attainment Summary */}
        <div className="rounded-lg p-4 shadow-md border border-black border-opacity-10">
          <h3 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">CO Attainment Summary</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-md">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-indigo-700 border-b-2 border-gray-200 border-opacity-10">Course Outcomes</th>
                  {Object.keys(coWeightages || {}).map(co => (
                    <th key={co} className="px-4 py-2 text-center text-sm font-medium text-indigo-700 border-b-2 border-gray-200 border-opacity-10">{co}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-indigo-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200 border-opacity-10">Weights</td>
                  {Object.keys(coWeightages || {}).map(co => (
                    <td key={co} className="px-4 py-2 text-center text-sm text-gray-600 border-b border-gray-200 border-opacity-10">{attainmentSummary.weights[co] || "0.00%"}</td>
                  ))}
                </tr>
                <tr className="hover:bg-indigo-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200 border-opacity-10">No. of students scored ≥ 3</td>
                  {Object.keys(coWeightages || {}).map(co => (
                    <td key={co} className="px-4 py-2 text-center text-sm text-gray-600 border-b border-gray-200 border-opacity-10">{attainmentSummary.studentsScored3[co] || 0}</td>
                  ))}
                </tr>
                <tr className="hover:bg-indigo-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200 border-opacity-10">Percentage of students scored ≥ 3</td>
                  {Object.keys(coWeightages || {}).map(co => (
                    <td key={co} className="px-4 py-2 text-center text-sm text-gray-600 border-b border-gray-200 border-opacity-10">{attainmentSummary.percentageScored3[co] || "0%"}</td>
                  ))}
                </tr>
                <tr className="hover:bg-indigo-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200 border-opacity-10">Attainment Level</td>
                  {Object.keys(coWeightages || {}).map(co => (
                    <td key={co} className="px-4 py-2 text-center text-sm text-gray-600 border-b border-gray-200 border-opacity-10">{attainmentSummary.attainmentLevel[co] || 0}</td>
                  ))}
                </tr>
                <tr className="hover:bg-indigo-50">
                  <td className="px-4 py-2 text-sm font-bold text-indigo-700">Overall Course Attainment</td>
                  <td colSpan={Object.keys(coWeightages || {}).length} className="px-4 py-2 text-center text-lg font-bold text-indigo-700">
                    {attainmentSummary.overallAttainment?.toFixed(4) || "0.0000"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* % of Students Scored Chart */}
        <div className="rounded-lg p-4 shadow-md border border-black border-opacity-10">
          <h3 className="text-lg font-semibold text-green-700 mb-4 border-b pb-2">% of Students Scored ≥ 3</h3>
          <div className="h-64">
            <Bar data={percentageChartData} options={percentageChartOptions} />
          </div>
        </div>

        {/* Program Attainment */}
        {Object.keys(programAttainment).length > 0 && (
          <div className="rounded-lg p-4 shadow-md border border-black border-opacity-10">
            <h3 className="text-lg font-semibold text-red-700 mb-4 border-b pb-2">Program Attainment</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-md">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-red-700 border-b-2 border-gray-200 border-opacity-10">Program Outcomes</th>
                    {Object.keys(programAttainment).map(po => (
                      <th key={po} className="px-4 py-2 text-center text-sm font-medium text-red-700 border-b-2 border-gray-200 border-opacity-10">{po}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-red-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200 border-opacity-10">Program Attainment</td>
                    {Object.keys(programAttainment).map(po => (
                      <td key={po} className="px-4 py-2 text-center text-sm text-gray-600 border-b border-gray-200 border-opacity-10">{programAttainment[po]}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Program Attainment Chart */}
        {Object.keys(programAttainment).length > 0 && (
          <div className="rounded-lg p-4 shadow-md border border-black border-opacity-10">
            <h3 className="text-lg font-semibold text-red-700 mb-4 border-b pb-2">Program Attainment Chart</h3>
            <div className="h-64">
              <Bar data={programAttainmentData} options={programAttainmentChartOptions} />
            </div>
          </div>
        )}

        {/* Student-wise CO Achievement */}
        {studentPerformance.length > 0 && (
          <div className="rounded-lg p-4 shadow-md border border-black border-opacity-10 col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold text-purple-700 mb-4 border-b pb-2">Student-wise CO Achievement</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-md">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-purple-700 border-b-2 border-gray-200 border-opacity-10">NAME</th>
                    {Object.keys(coWeightages || {}).map(co => (
                      <th key={co} className="px-4 py-2 text-center text-sm font-medium text-purple-700 border-b-2 border-gray-200 border-opacity-10">{co} Score</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studentPerformance.slice(0, 5).map((student, index) => (
                    <tr key={student.id} className={index % 2 === 0 ? "hover:bg-purple-50" : "hover:bg-purple-50"}>
                      <td className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200 border-opacity-10">{student.rollNumber}</td>
                      {Object.keys(coWeightages || {}).map(co => (
                        <td key={co} className="px-4 py-2 text-center text-sm text-gray-600 border-b border-gray-200 border-opacity-10">{student.coScores[co]}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="hover:bg-purple-100">
                    <td className="px-4 py-2 text-sm font-bold text-purple-700 border-b border-gray-200 border-opacity-10">Average</td>
                    {Object.keys(coWeightages || {}).map(co => (
                      <td key={co} className="px-4 py-2 text-center text-sm font-bold text-purple-700 border-b border-gray-200 border-opacity-10">{averages[co] || "0.00"}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Course Outcome Attainment Chart */}
        {studentPerformance.length > 0 && (
          <div className="rounded-lg p-4 shadow-md border border-black border-opacity-10 col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold text-amber-700 mb-4 border-b pb-2">Course Outcome Attainment</h3>
            <div className="h-64">
              <Bar data={courseAttainmentChartData} options={courseAttainmentChartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default COAttainmentAnalysis;