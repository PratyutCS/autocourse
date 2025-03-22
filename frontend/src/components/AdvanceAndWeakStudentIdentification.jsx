import React, { useState, useEffect } from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';

const AdvanceAndWeakStudentIdentification = ({
  coWeightages,
  studentData,
  coAttainmentCriteria,
  learnerCategories,
  onSave 
}) => {
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [filteredPerformance, setFilteredPerformance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  
  useEffect(() => {
    if (learnerCategories && Array.isArray(learnerCategories)) {
      // If learnerCategories is already an array, use it directly
      setFilteredPerformance(learnerCategories);
    } else if (learnerCategories && typeof learnerCategories === 'object') {
      // Convert from object format to array format if needed
      // This handles cases where learnerCategories might be in the old format
      const combinedStudents = [
        ...(learnerCategories.advancedLearners || []),
        ...(learnerCategories.mediumLearners || []),
        ...(learnerCategories.slowLearners || [])
      ];
      
      if (combinedStudents.length > 0) {
        setFilteredPerformance(combinedStudents);
      } else if (coWeightages && studentData && coAttainmentCriteria) {
        // No saved data in any format, calculate from scratch
        calculateStudentAchievement();
      }
    } else if (coWeightages && studentData && coAttainmentCriteria) {
      // If no saved data at all, calculate from scratch
      calculateStudentAchievement();
    }
  }, [learnerCategories, coWeightages, studentData, coAttainmentCriteria]);

  useEffect(() => {
    if (coWeightages && studentData && coAttainmentCriteria) {
      calculateStudentAchievement();
    }
  }, [coWeightages, studentData, coAttainmentCriteria]);

  useEffect(() => {
    // Filter students based on performance criteria
    if (studentPerformance.length > 0) {
      const filtered = studentPerformance.filter(student => {
        const coScores = Object.values(student.coScores);
        return coScores.every(score => score === 3) || coScores.every(score => score === 1);
      });
      setFilteredPerformance(filtered);
    }
  }, [studentPerformance]);

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
          
          // Calculate the row average
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
      setFilteredPerformance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = (student) => {
    setStudentToRemove(student);
    setShowConfirmation(true);
  };

  const confirmRemoval = () => {
    if (studentToRemove) {
      const updatedFilteredList = filteredPerformance.filter(
        student => student.id !== studentToRemove.id
      );
      setFilteredPerformance(updatedFilteredList);
      
      // Save the updated list in the proper format for the parent component
      if (onSave) {
        // Convert the flat array back to categorized format
        const categorizedData = updatedFilteredList.reduce((acc, student) => {
          const coScores = Object.values(student.coScores);
          
          if (coScores.every(score => score === 3)) {
            acc.advancedLearners = [...(acc.advancedLearners || []), student];
          } else if (coScores.every(score => score === 1)) {
            acc.slowLearners = [...(acc.slowLearners || []), student];
          } else {
            // Just in case there are medium learners
            acc.mediumLearners = [...(acc.mediumLearners || []), student];
          }
          
          return acc;
        }, { advancedLearners: [], mediumLearners: [], slowLearners: [] });
        
        onSave(categorizedData);
      }
      
      setShowConfirmation(false);
      setStudentToRemove(null);
    }
  };

  const cancelRemoval = () => {
    setShowConfirmation(false);
    setStudentToRemove(null);
  };

  const getStudentType = (student) => {
    const coScores = Object.values(student.coScores);
    if (coScores.every(score => score === 3)) return "Advanced";
    if (coScores.every(score => score === 1)) return "Weak";
    return "Regular";
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

  const totalColumns = Object.keys(coWeightages).length + 2; // Name column + CO scores columns + Action column

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
            <table className="min-w-full border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <th className="bg-gray-50 border border-gray-200 p-3 font-semibold text-gray-700 text-sm">
                    NAME
                  </th>
                  {Object.keys(coWeightages || {}).map(co => (
                    <th key={co} className="bg-gray-50 border border-gray-200 p-3 font-semibold text-gray-700 text-sm">
                      {co} Score
                    </th>
                  ))}
                  <th className="bg-gray-50 border border-gray-200 p-3 font-semibold text-gray-700 text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPerformance.map(student => {
                  const coScores = Object.values(student.coScores);
                  const isAdvancedLearner = coScores.every(score => score === 3);
                  const isSlowLearner = coScores.every(score => score === 1);
                  const rowClassName = isAdvancedLearner
                    ? "bg-blue-50 hover:bg-blue-100"
                    : isSlowLearner
                      ? "bg-orange-50 hover:bg-orange-100"
                      : "";
                  return (
                    <tr key={student.id} className={rowClassName}>
                      <td className="border border-gray-200 p-3 font-medium">
                        {student.rollNumber}
                      </td>
                      {Object.keys(coWeightages || {}).map(co => (
                        <td key={`${student.id}_${co}`} className="border border-gray-200 p-3 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full 
                            ${student.coScores[co] === 3 ? 'bg-blue-100 text-blue-700 border border-blue-300' : 
                              student.coScores[co] === 1 ? 'bg-orange-100 text-orange-700 border border-orange-300' : 
                                'bg-gray-100 text-gray-700 border border-gray-300'}`}>
                            {student.coScores[co]}
                          </span>
                        </td>
                      ))}
                      <td className="border border-gray-200 p-3 text-center">
                        <button 
                          onClick={() => handleRemoveClick(student)}
                          className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none"
                          title={`Remove from ${getStudentType(student)} Learner list`}
                        >
                          <Trash2 className="w-5 h-5 text-gray-600" />
                        </button>
                      </td>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="inline-block w-8 h-8 mr-3 bg-blue-100 text-blue-700 border border-blue-300 rounded-full flex items-center justify-center font-medium">3</span>
                <div>
                  <span className="text-blue-700 font-medium">Advanced Learner</span>
                  <p className="text-xs text-gray-500 mt-1">Student has achieved full attainment in all COs</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="inline-block w-8 h-8 mr-3 bg-orange-100 text-orange-700 border border-orange-300 rounded-full flex items-center justify-center font-medium">1</span>
                <div>
                  <span className="text-orange-700 font-medium">Slow Learner</span>
                  <p className="text-xs text-gray-500 mt-1">Student has not achieved minimum attainment in any CO</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Confirmation Popup */}
          {showConfirmation && studentToRemove && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Confirm Removal</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to remove <span className="font-medium">{studentToRemove.rollNumber}</span> from the {getStudentType(studentToRemove)} Learner list?
                </p>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={cancelRemoval}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmRemoval}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
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