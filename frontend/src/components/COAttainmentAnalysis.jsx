import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowRight, Award, BarChart3, Users, Percent, BookOpen } from 'lucide-react';
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
  const [viewAll, setViewAll] = useState(false);

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

  // Function to get color based on attainment level
  const getAttainmentColor = (level) => {
    if (level >= 3) return 'text-amber-600';
    if (level >= 2) return 'text-amber-500';
    return 'text-red-500';
  };

  if (!coWeightages || !studentData || !coAttainmentCriteria || !copoMappingData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 m-4 border border-gray-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-amber-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md">
            <span className="text-lg font-bold">12</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Course Attainment Analysis
          </h2>
        </div>
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-md p-5 flex items-start">
          <AlertCircle className="h-6 w-6 text-amber-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-amber-800">Missing Required Data</h3>
            <p className="text-sm text-amber-700 mt-2">
              Please ensure CO weightages, student data, CO PO Mapping Data and attainment criteria are provided 
              before proceeding with the analysis.
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
        backgroundColor: 'rgba(245, 158, 11, 0.8)', // Amber
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1
      },
      {
        label: "Required",
        data: coLabels.map(() => 3),
        backgroundColor: 'rgba(251, 191, 36, 0.6)', // Yellow
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 1
      }
    ]
  };
  const courseAttainmentChartOptions = {
    indexAxis: 'y',
    scales: {
      x: { 
        beginAtZero: true, 
        max: 3,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(245, 158, 11, 0.9)',
        padding: 12,
        usePointStyle: true,
        titleColor: 'white',
        bodyColor: 'white'
      }
    },
    responsive: true,
    maintainAspectRatio: false
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
        backgroundColor: 'rgba(245, 158, 11, 0.8)', // Amber
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1
      }
    ]
  };
  const percentageChartOptions = {
    indexAxis: 'y',
    scales: {
      x: { 
        beginAtZero: true, 
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(245, 158, 11, 0.9)',
        padding: 12,
        usePointStyle: true,
        titleColor: 'white',
        bodyColor: 'white',
        callbacks: {
          label: function(context) {
            return `${context.raw}%`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  const poLabels = Object.keys(programAttainment);
  const programAttainmentData = {
    labels: poLabels,
    datasets: [
      {
        label: "Program Attainment",
        data: poLabels.map(po => parseFloat(programAttainment[po]) || 0),
        backgroundColor: 'rgba(251, 191, 36, 0.8)', // Yellow
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 1
      }
    ]
  };
  const programAttainmentChartOptions = {
    indexAxis: 'y',
    scales: { 
      x: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(245, 158, 11, 0.9)',
        padding: 12,
        usePointStyle: true,
        titleColor: 'white',
        bodyColor: 'white'
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-4 mb-8">
        <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              12
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Course Attainment Analysis
        </h2>
      </div>
      {/* Overall Attainment Card */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-lg shadow-lg mb-8 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium opacity-90">Overall Course Attainment</h3>
            <p className="text-4xl font-bold mt-2">{attainmentSummary.overallAttainment?.toFixed(2) || "0.00"}</p>
          </div>
          <Award className="h-16 w-16 opacity-80" />
        </div>
      </div>
      
      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CO Attainment Summary */}
        <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-amber-600 mr-2" />
            <h3 className="text-lg font-semibold text-amber-700">CO Attainment Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-amber-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider border-b border-amber-200">Course Outcomes</th>
                  {Object.keys(coWeightages || {}).map(co => (
                    <th key={co} className="px-4 py-3 text-center text-xs font-medium text-amber-800 uppercase tracking-wider border-b border-amber-200">{co}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                <tr className="hover:bg-amber-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">Weights</td>
                  {Object.keys(coWeightages || {}).map(co => (
                    <td key={co} className="px-4 py-3 text-center text-sm text-gray-600">{attainmentSummary.weights[co] || "0.00%"}</td>
                  ))}
                </tr>
                <tr className="hover:bg-amber-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">Students scored ≥ 3</td>
                  {Object.keys(coWeightages || {}).map(co => (
                    <td key={co} className="px-4 py-3 text-center text-sm text-gray-600">{attainmentSummary.studentsScored3[co] || 0}</td>
                  ))}
                </tr>
                <tr className="hover:bg-amber-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">% of students scored ≥ 3</td>
                  {Object.keys(coWeightages || {}).map(co => (
                    <td key={co} className="px-4 py-3 text-center text-sm text-gray-600">{attainmentSummary.percentageScored3[co] || "0%"}</td>
                  ))}
                </tr>
                <tr className="hover:bg-amber-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">Attainment Level</td>
                  {Object.keys(coWeightages || {}).map(co => {
                    const level = attainmentSummary.attainmentLevel[co] || 0;
                    return (
                      <td key={co} className={`px-4 py-3 text-center text-sm font-medium ${getAttainmentColor(level)}`}>
                        {level}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* % of Students Scored Chart */}
        <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <Percent className="h-5 w-5 text-amber-600 mr-2" />
            <h3 className="text-lg font-semibold text-amber-700">% of Students Scored ≥ 3</h3>
          </div>
          <div className="h-64">
            <Bar data={percentageChartData} options={percentageChartOptions} />
          </div>
        </div>

        {/* Program Attainment */}
        {Object.keys(programAttainment).length > 0 && (
          <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
            <div className="flex items-center mb-4">
              <BookOpen className="h-5 w-5 text-amber-600 mr-2" />
              <h3 className="text-lg font-semibold text-amber-700">Program Attainment</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider border-b border-amber-200">Program Outcomes</th>
                    {Object.keys(programAttainment).map(po => (
                      <th key={po} className="px-4 py-3 text-center text-xs font-medium text-amber-800 uppercase tracking-wider border-b border-amber-200">{po}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-amber-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Program Attainment</td>
                    {Object.keys(programAttainment).map(po => (
                      <td key={po} className="px-4 py-3 text-center text-sm font-medium text-gray-600">{programAttainment[po]}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Program Attainment Chart */}
        {Object.keys(programAttainment).length > 0 && (
          <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-5 w-5 text-amber-600 mr-2" />
              <h3 className="text-lg font-semibold text-amber-700">Program Attainment Chart</h3>
            </div>
            <div className="h-64">
              <Bar data={programAttainmentData} options={programAttainmentChartOptions} />
            </div>
          </div>
        )}

        {/* Course Outcome Attainment Chart */}
        {studentPerformance.length > 0 && (
          <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200 col-span-1 lg:col-span-2">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-5 w-5 text-amber-600 mr-2" />
              <h3 className="text-lg font-semibold text-amber-700">Course Outcome Attainment</h3>
            </div>
            <div className="h-64">
              <Bar data={courseAttainmentChartData} options={courseAttainmentChartOptions} />
            </div>
          </div>
        )}

        {/* Student-wise CO Achievement */}
        {studentPerformance.length > 0 && (
          <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200 col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-amber-600 mr-2" />
                <h3 className="text-lg font-semibold text-amber-700">Student-wise CO Achievement</h3>
              </div>
              {studentPerformance.length > 5 && (
                <button 
                  onClick={() => setViewAll(!viewAll)} 
                  className="text-amber-600 hover:text-amber-800 flex items-center text-sm font-medium transition-colors"
                >
                  {viewAll ? 'Show Less' : 'View All'}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              )}
            </div>
            <div className="overflow-x-auto overflow-y-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="bg-amber-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider border-b border-amber-200">NAME</th>
                    {Object.keys(coWeightages || {}).map(co => (
                      <th key={co} className="px-4 py-3 text-center text-xs font-medium text-amber-800 uppercase tracking-wider border-b border-amber-200">{co} Score</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {(viewAll ? studentPerformance : studentPerformance.slice(0, 5)).map((student, index) => (
                    <tr key={student.id} className="hover:bg-amber-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">{student.rollNumber}</td>
                      {Object.keys(coWeightages || {}).map(co => {
                        const score = student.coScores[co];
                        return (
                          <td key={co} className={`px-4 py-3 text-center text-sm font-medium ${getAttainmentColor(score)}`}>
                            {score}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-amber-50">
                    <td className="px-4 py-3 text-sm font-bold text-amber-800">Average</td>
                    {Object.keys(coWeightages || {}).map(co => (
                      <td key={co} className="px-4 py-3 text-center text-sm font-bold text-amber-800">{averages[co] || "0.00"}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default COAttainmentAnalysis;