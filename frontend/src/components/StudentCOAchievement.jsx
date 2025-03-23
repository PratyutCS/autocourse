import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';

const StudentCOAchievement = ({ 
  selectedAssessments, 
  coWeightages, 
  studentData, 
  coAttainmentCriteria,
  learnerCategories, 
  onSave 
}) => {
  // State for complete student performance calculated from the assessments.
  const [studentPerformance, setStudentPerformance] = useState([]);
  // State for system-identified advanced and slow learners.
  const [systemIdentified, setSystemIdentified] = useState({ advanced: [], slow: [] });
  // Local state for the user's modifications to learner categories.
  // Format: [advancedLearners, slowLearners]
  const [localLearnerCategories, setLocalLearnerCategories] = useState([[], []]);
  // States for removal confirmation popup.
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);

  // Initialize localLearnerCategories state from prop if available.
  useEffect(() => {
    if (learnerCategories) {
      if (Array.isArray(learnerCategories)) {
        setLocalLearnerCategories(learnerCategories);
      } else if (typeof learnerCategories === 'object') {
        setLocalLearnerCategories([
          learnerCategories.advancedLearners || [],
          learnerCategories.slowLearners || []
        ]);
      }
    }
  }, [learnerCategories]);

  // Get only the COs that are affected by the selected assessments.
  const getRelevantCOs = () => {
    if (!coWeightages || !selectedAssessments) return [];
    return Object.keys(coWeightages).filter(co => 
      selectedAssessments.some(assessment => parseFloat(coWeightages[co]?.[assessment.toLowerCase()] || 0) > 0)
    );
  };

  // Calculate the attainment for each student using only the selected assessments and the relevant COs.
  const calculateAttainment = () => {
    const performanceData = [];
    const relevantCOs = getRelevantCOs();
    
    if (studentData?.maxMarks && studentData?.data) {
      // Only include selected assessments
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

        // Calculate row average
        const coScoreValues = Object.values(studentResult.coScores);
        const rowAverage = coScoreValues.length > 0
          ? (coScoreValues.reduce((sum, score) => sum + score, 0) / coScoreValues.length)
          : 0;
        studentResult.rowAverage = parseFloat(rowAverage.toFixed(2));

        performanceData.push(studentResult);
      });
    }

    // Sort students by row average descending.
    performanceData.sort((a, b) => b.rowAverage - a.rowAverage);
    setStudentPerformance(performanceData);

    // Determine system identified learners.
    const sysAdvanced = performanceData.filter(student =>
      Object.values(student.coScores).every(score => score === 3)
    );
    const sysSlow = performanceData.filter(student =>
      Object.values(student.coScores).every(score => score === 1)
    );
    setSystemIdentified({ advanced: sysAdvanced, slow: sysSlow });
  };

  useEffect(() => {
    if (coWeightages && studentData && coAttainmentCriteria && selectedAssessments && selectedAssessments.length > 0) {
      calculateAttainment();
    }
  }, [coWeightages, studentData, coAttainmentCriteria, selectedAssessments]);

  // Helper function to get student type.
  const getStudentType = (student) => {
    const coScores = Object.values(student.coScores);
    if (coScores.every(score => score === 3)) return "Advanced";
    if (coScores.every(score => score === 1)) return "Slow";
    return "Regular";
  };

  // Initiate removal confirmation popup.
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
      } else if (categoryType === "Slow") {
        updatedCategories[1] = updatedCategories[1].filter(s => s.id !== student.id);
      }
      setLocalLearnerCategories(updatedCategories);
      if (onSave) onSave(updatedCategories);
      setShowConfirmation(false);
      setStudentToRemove(null);
    }
  };

  const cancelRemoval = () => {
    setShowConfirmation(false);
    setStudentToRemove(null);
  };

  // Add a learner to localLearnerCategories.
  const addLearner = (student, categoryType) => {
    let updatedCategories = [...localLearnerCategories];
    if (categoryType === "Advanced") {
      if (!updatedCategories[0].some(s => s.id === student.id)) {
        updatedCategories[0] = [...updatedCategories[0], student];
      }
    } else if (categoryType === "Slow") {
      if (!updatedCategories[1].some(s => s.id === student.id)) {
        updatedCategories[1] = [...updatedCategories[1], student];
      }
    }
    setLocalLearnerCategories(updatedCategories);
    if (onSave) onSave(updatedCategories);
  };

  // Compute unmatched learners.
  const unmatchedAdvanced = systemIdentified.advanced.filter(
    student => !localLearnerCategories[0].some(s => s.id === student.id)
  );
  const unmatchedSlow = systemIdentified.slow.filter(
    student => !localLearnerCategories[1].some(s => s.id === student.id)
  );

  // Render table for a given list of learners.
  // mode "local" for learners already in localLearnerCategories, "unmatched" for those that can be added.
  const renderTable = (students, categoryType, mode = "local") => {
    const relevantCOs = getRelevantCOs();
    return (
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="bg-gray-50 border border-gray-200 p-3 font-semibold text-gray-700 text-sm">NAME</th>
              {relevantCOs.map(co => (
                <th key={co} className="bg-gray-50 border border-gray-200 p-3 font-semibold text-gray-700 text-sm">
                  {co} Score
                </th>
              ))}
              <th className="bg-gray-50 border border-gray-200 p-3 font-semibold text-gray-700 text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => {
              const rowClassName =
                categoryType === "Advanced"
                  ? "bg-blue-50 hover:bg-blue-100"
                  : "bg-orange-50 hover:bg-orange-100";
              return (
                <tr key={student.id} className={rowClassName}>
                  <td className="border border-gray-200 p-3 font-medium">{student.rollNumber}</td>
                  {relevantCOs.map(co => (
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
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                        title={`Remove from ${categoryType} Learner list`}
                      >
                        <Trash2 className="w-5 h-5 text-gray-600" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => addLearner(student, categoryType)}
                        className="p-2 rounded-full hover:bg-green-200 transition-colors duration-200"
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
          Total {categoryType} Learners: {students.length}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg p-4 shadow-md border border-black border-opacity-10">
      <h3 className="text-lg font-semibold text-purple-700 mb-4 border-b pb-2">
        Advanced &amp; Slow learner identification for partial Semester
      </h3>
      
      {(!selectedAssessments || selectedAssessments.length === 0) ? (
        <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
          Please select the assessment first.
        </div>
      ) : (
        <>
          {/* Display System Identified Learners as Learner Categories */}
          <div className="mb-8">
            <h4 className="text-md font-medium mb-2">Advanced Learners</h4>
            {localLearnerCategories[0].length > 0 ? 
              renderTable(localLearnerCategories[0], "Advanced", "local")
              : <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">No Advanced Learners</div>}
            
            <h4 className="text-md font-medium mb-2">Slow Learners</h4>
            {localLearnerCategories[1].length > 0 ? 
              renderTable(localLearnerCategories[1], "Slow", "local")
              : <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">No Slow Learners</div>}
          </div>

          {/* Display Unmatched Learners for addition */}
          <div className="mb-8">
            <h4 className="text-md font-medium mb-2">Unmatched Advanced Learners</h4>
            {unmatchedAdvanced.length > 0 ? 
              renderTable(unmatchedAdvanced, "Advanced", "unmatched")
              : <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
                  All Advanced Learners are added
                </div>}
            <h4 className="text-md font-medium mb-2">Unmatched Slow Learners</h4>
            {unmatchedSlow.length > 0 ? 
              renderTable(unmatchedSlow, "Slow", "unmatched")
              : <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
                  All Slow Learners are added
                </div>}
          </div>
        </>
      )}
      
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

export default StudentCOAchievement;