import React, { useState, useEffect } from 'react';
import { AlertCircle, Trash2, Plus } from 'lucide-react';

const AdvanceAndWeakStudentIdentification = ({
  coWeightages,
  studentData,
  coAttainmentCriteria,
  learnerCategories,
  onSave 
}) => {
  // State that holds the complete student performance data from calculations.
  const [studentPerformance, setStudentPerformance] = useState([]);
  // State that holds system-identified advanced and Low Performers separately.
  const [systemIdentified, setSystemIdentified] = useState({ advanced: [], weak: [] });
  // State for the user's modified learnerCategories.
  // Expected to be an array of arrays: [advancedLearners, weakLearners]
  const [localLearnerCategories, setLocalLearnerCategories] = useState([[], []]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for removal confirmation popup.
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);

  // Initialize localLearnerCategories state from prop if available.
  useEffect(() => {
    if (learnerCategories) {
      if (Array.isArray(learnerCategories)) {
        // Assuming learnerCategories is provided as [advancedLearners, weakLearners]
        setLocalLearnerCategories(learnerCategories);
      } else if (typeof learnerCategories === 'object') {
        // Convert from object format to array format.
        setLocalLearnerCategories([
          learnerCategories.advancedLearners || [],
          learnerCategories.slowLearners || []
        ]);
      }
    }
  }, [learnerCategories]);

  // Calculate the student achievement and system-identified learners.
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
          
          // Calculate the row average for reference.
          const coScoreValues = Object.values(studentResult.coScores);
          const rowAverage = coScoreValues.length > 0 
            ? (coScoreValues.reduce((sum, score) => sum + score, 0) / coScoreValues.length)
            : 0;
          studentResult.rowAverage = parseFloat(rowAverage.toFixed(2));
          
          performanceData.push(studentResult);
        });
      }
      
      // Sort by rowAverage descending.
      performanceData.sort((a, b) => b.rowAverage - a.rowAverage);
      setStudentPerformance(performanceData);

      // Determine system identified learners.
      const sysAdvanced = performanceData.filter(student =>
        Object.values(student.coScores).every(score => score === 3)
      );
      const sysWeak = performanceData.filter(student =>
        Object.values(student.coScores).every(score => score === 1)
      );
      setSystemIdentified({ advanced: sysAdvanced, weak: sysWeak });
    } catch (err) {
      console.error("Error in calculateStudentAchievement:", err);
      setError("Failed to calculate student achievement data");
      setStudentPerformance([]);
      setSystemIdentified({ advanced: [], weak: [] });
    } finally {
      setLoading(false);
    }
  };

  // Recalculate achievement when required props change.
  useEffect(() => {
    if (coWeightages && studentData && coAttainmentCriteria) {
      calculateStudentAchievement();
    }
  }, [coWeightages, studentData, coAttainmentCriteria]);

  // Helper function to get student type.
  const getStudentType = (student) => {
    const coScores = Object.values(student.coScores);
    if (coScores.every(score => score === 3)) return "Advanced";
    if (coScores.every(score => score === 1)) return "Weak";
    return "Regular";
  };

  // Initiate removal confirmation popup for deletion from learner categories.
  const handleRemoveClick = (student, categoryType) => {
    setStudentToRemove({ student, categoryType });
    setShowConfirmation(true);
  };

  // Confirm removal of a student from localLearnerCategories.
  const confirmRemoval = () => {
    if (studentToRemove) {
      const { student, categoryType } = studentToRemove;
      let updatedCategories = [...localLearnerCategories];
      if (categoryType === "Advanced") {
        updatedCategories[0] = updatedCategories[0].filter(s => s.id !== student.id);
      } else if (categoryType === "Weak") {
        updatedCategories[1] = updatedCategories[1].filter(s => s.id !== student.id);
      }
      setLocalLearnerCategories(updatedCategories);
      // Call onSave only when the learnerCategories has been modified.
      if (onSave) {
        onSave(updatedCategories);
      }
      setShowConfirmation(false);
      setStudentToRemove(null);
    }
  };

  const cancelRemoval = () => {
    setShowConfirmation(false);
    setStudentToRemove(null);
  };

  // Add a learner from unmatched data into learnerCategories.
  const addLearner = (student, categoryType) => {
    let updatedCategories = [...localLearnerCategories];
    if (categoryType === "Advanced") {
      // Avoid duplicate addition.
      if (!updatedCategories[0].some(s => s.id === student.id)) {
        updatedCategories[0] = [...updatedCategories[0], student];
      }
    } else if (categoryType === "Weak") {
      if (!updatedCategories[1].some(s => s.id === student.id)) {
        updatedCategories[1] = [...updatedCategories[1], student];
      }
    }
    setLocalLearnerCategories(updatedCategories);
    if (onSave) {
      onSave(updatedCategories);
    }
  };

  // Compute unmatched learners.
  // For each category in system-identified learners, find those not in localLearnerCategories.
  const unmatchedAdvanced = systemIdentified.advanced.filter(
    student => !localLearnerCategories[0].some(s => s.id === student.id)
  );
  const unmatchedWeak = systemIdentified.weak.filter(
    student => !localLearnerCategories[1].some(s => s.id === student.id)
  );

  // Render table function with mode parameter to decide on action button.
  // mode: "local" for learnerCategories (delete button) and "unmatched" for unmatched table (add button)
  const renderTable = (students, categoryType, mode = "local") => {
    const totalColumns = Object.keys(coWeightages).length + 2; // Name column + CO score columns + Action column
    return (
      <div className="overflow-x-auto mb-6">
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
            {students.map(student => {
              const rowClassName =
                categoryType === "Advanced"
                  ? "bg-blue-50 hover:bg-blue-100"
                  : categoryType === "Weak"
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
                    {mode === "local" ? (
                      <button 
                        onClick={() => handleRemoveClick(student, categoryType)}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none"
                        title={`Remove from ${categoryType} Learner list`}
                      >
                        <Trash2 className="w-5 h-5 text-gray-600" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => addLearner(student, categoryType)}
                        className="p-2 rounded-full hover:bg-green-200 transition-colors duration-200 focus:outline-none"
                        title={`Add to ${categoryType} Learner list`}
                      >
                        <Plus className="w-5 h-5 text-green-700" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-2 text-sm text-gray-600 text-center">
          Total {categoryType} Learners: {students.length} | Total Columns: {totalColumns}
        </div>
      </div>
    );
  };

  if (!coWeightages || !studentData || !coAttainmentCriteria) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
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

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center">
          12
        </div>
        <h2 className="section-title text-xl font-semibold text-gray-800">
          Advanced &amp; Weak Students
        </h2>
      </div>
      
      {/* Display Learner Categories as is */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Learner Categories</h3>
        <div>
          <h4 className="text-md font-medium mb-2">Advanced performers</h4>
          {localLearnerCategories[0].length > 0 ? 
            renderTable(localLearnerCategories[0], "Advanced", "local")
            : <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">No Advanced performers</div>}
        </div>
        <div>
          <h4 className="text-md font-medium mb-2">Low Performers</h4>
          {localLearnerCategories[1].length > 0 ? 
            renderTable(localLearnerCategories[1], "Weak", "local")
            : <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">No Low Performers</div>}
        </div>
      </div>

      {/* Display Unmatched Learners */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Unmatched Learners</h3>
        <div>
          <h4 className="text-md font-medium mb-2">Unmatched Advanced performers</h4>
          {unmatchedAdvanced.length > 0 ? 
            renderTable(unmatchedAdvanced, "Advanced", "unmatched")
            : <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
                All Advanced performers are in the Learner Categories
              </div>}
        </div>
        <div>
          <h4 className="text-md font-medium mb-2">Unmatched Low Performers</h4>
          {unmatchedWeak.length > 0 ? 
            renderTable(unmatchedWeak, "Weak", "unmatched")
            : <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
                All Low Performers are in the Learner Categories
              </div>}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-base font-semibold mb-2">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
            <span className="inline-block w-8 h-8 mr-3 bg-blue-100 text-blue-700 border border-blue-300 rounded-full flex items-center justify-center font-medium">3</span>
            <div>
              <span className="text-blue-700 font-medium">Advanced performers</span>
              <p className="text-xs text-gray-500 mt-1">Student has achieved full attainment in all COs</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
            <span className="inline-block w-8 h-8 mr-3 bg-orange-100 text-orange-700 border border-orange-300 rounded-full flex items-center justify-center font-medium">1</span>
            <div>
              <span className="text-orange-700 font-medium">Low Performer</span>
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
              Are you sure you want to remove <span className="font-medium">{studentToRemove.student.rollNumber}</span> from the {studentToRemove.categoryType} Learner list?
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
  );
};

export default AdvanceAndWeakStudentIdentification;