import React, { useState, useEffect } from 'react';
import { Trash2, Plus, ArrowUpDown, Search } from 'lucide-react';

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
  // State for system-identified advanced and Low performers.
  const [systemIdentified, setSystemIdentified] = useState({ advanced: [], slow: [] });
  // Local state for the user's modifications to learner categories.
  // Format: [advancedLearners, slowLearners]
  const [localLearnerCategories, setLocalLearnerCategories] = useState([[], []]);
  // States for removal confirmation popup.
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  // State for sorting
  const [sortConfig, setSortConfig] = useState({ key: 'rowAverage', direction: 'desc' });

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

  // Sorting handler
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter students based on search term
  const filterStudents = (students) => {
    if (!searchTerm) return students;
    return students.filter(student => 
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toString().includes(searchTerm)
    );
  };

  // Sort students based on current sort config
  const sortStudents = (students) => {
    if (!sortConfig.key) return students;
    
    return [...students].sort((a, b) => {
      if (sortConfig.key === 'rollNumber') {
        return sortConfig.direction === 'asc' 
          ? a.rollNumber.localeCompare(b.rollNumber)
          : b.rollNumber.localeCompare(a.rollNumber);
      }
      
      if (sortConfig.key === 'rowAverage' || sortConfig.key.startsWith('CO')) {
        const aValue = sortConfig.key === 'rowAverage' 
          ? a.rowAverage 
          : a.coScores[sortConfig.key] || 0;
        const bValue = sortConfig.key === 'rowAverage' 
          ? b.rowAverage 
          : b.coScores[sortConfig.key] || 0;
        
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  };

  // Render table for a given list of learners.
  // mode "local" for learners already in localLearnerCategories, "unmatched" for those that can be added.
  const renderTable = (students, categoryType, mode = "local") => {
    const relevantCOs = getRelevantCOs();
    const filteredStudents = filterStudents(students);
    const sortedStudents = sortStudents(filteredStudents);
    
    // Category styling
    const categoryStyles = {
      Advanced: {
        header: "bg-blue-100 text-blue-800",
        row: "bg-blue-50 hover:bg-blue-100",
        badge: "bg-blue-100 text-blue-700 border border-blue-300",
        count: "bg-blue-100 text-blue-800"
      },
      Slow: {
        header: "bg-orange-100 text-orange-800",
        row: "bg-orange-50 hover:bg-orange-100",
        badge: "bg-orange-100 text-orange-700 border border-orange-300",
        count: "bg-orange-100 text-orange-800"
      }
    };
    
    return (
      <div className="mb-8 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className={`${categoryStyles[categoryType].header} px-4 py-3 flex justify-between items-center`}>
          <h4 className="text-md font-semibold">{categoryType} Performers</h4>
          <div className="flex items-center">
            <div className={`${categoryStyles[categoryType].count} px-3 py-1 rounded-full text-sm`}>
              {filteredStudents.length} Students
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or ID..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="min-w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th 
                      className="p-3 text-left font-semibold text-gray-700 text-sm cursor-pointer"
                      onClick={() => requestSort('rollNumber')}
                    >
                      <div className="flex items-center">
                        NAME
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </div>
                    </th>
                    {relevantCOs.map(co => (
                      <th 
                        key={co} 
                        className="p-3 text-center font-semibold text-gray-700 text-sm cursor-pointer"
                        onClick={() => requestSort(co)}
                      >
                        <div className="flex items-center justify-center">
                          {co} Score
                          <ArrowUpDown className="w-4 h-4 ml-1" />
                        </div>
                      </th>
                    ))}
                    <th 
                      className="p-3 text-center font-semibold text-gray-700 text-sm cursor-pointer"
                      onClick={() => requestSort('rowAverage')}
                    >
                      <div className="flex items-center justify-center">
                        AVG
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </div>
                    </th>
                    <th className="p-3 text-center font-semibold text-gray-700 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.length > 0 ? (
                    sortedStudents.map(student => (
                      <tr key={student.id} className={`${categoryStyles[categoryType].row} transition-colors duration-200`}>
                        <td className="border-b border-gray-200 p-3 font-medium">{student.rollNumber}</td>
                        {relevantCOs.map(co => (
                          <td key={`${student.id}_${co}`} className="border-b border-gray-200 p-3 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full 
                              ${student.coScores[co] === 3 ? 'bg-blue-100 text-blue-700 border border-blue-300' : 
                                student.coScores[co] === 1 ? 'bg-orange-100 text-orange-700 border border-orange-300' : 
                                'bg-gray-100 text-gray-700 border border-gray-300'}`}>
                              {student.coScores[co]}
                            </span>
                          </td>
                        ))}
                        <td className="border-b border-gray-200 p-3 text-center font-medium">
                          {student.rowAverage}
                        </td>
                        <td className="border-b border-gray-200 p-3 text-center">
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={relevantCOs.length + 3} className="text-center py-6 text-gray-500 bg-gray-50">
                        {searchTerm ? "No students match your search criteria" : `No ${categoryType.toLowerCase()} performers found`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 mt-10 bg-white">
      <div className="bg-gradient-to-r from-amber-600 to-amber-300 text-white py-4 px-6 rounded-t-lg">
        <h3 className="text-xl font-semibold">
          Advanced &amp; Low Performer Identification
        </h3>
        <p className="text-sm text-blue-100 mt-1">
          Semester Progress Analysis
        </p>
      </div>
      
      <div className="p-6">
        {(!selectedAssessments || selectedAssessments.length === 0) ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
            <div className="text-lg font-medium mb-2">No Assessments Selected</div>
            <p>Please select at least one assessment to view student performance data.</p>
          </div>
        ) : (
          <>
            {/* Display System Identified Learners as Learner Categories */}
            <div className="space-y-6">
              {/* Advanced Performers Section */}
              {localLearnerCategories[0].length > 0 ? 
                renderTable(localLearnerCategories[0], "Advanced", "local")
                : 
                <div className="mb-8 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-blue-100 text-blue-800 px-4 py-3">
                    <h4 className="text-md font-semibold">Advanced Performers</h4>
                  </div>
                  <div className="bg-white p-6 text-center text-gray-500">
                    No advanced performers identified yet
                  </div>
                </div>
              }
              
              {/* Low Performers Section */}
              {localLearnerCategories[1].length > 0 ? 
                renderTable(localLearnerCategories[1], "Slow", "local")
                : 
                <div className="mb-8 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-orange-100 text-orange-800 px-4 py-3">
                    <h4 className="text-md font-semibold">Low Performers</h4>
                  </div>
                  <div className="bg-white p-6 text-center text-gray-500">
                    No low performers identified yet
                  </div>
                </div>
              }
            </div>

            {/* Section Divider */}
            <div className="flex items-center my-8">
              <div className="flex-grow h-px bg-gray-200"></div>
              <span className="px-4 text-sm font-medium text-gray-500">SYSTEM RECOMMENDATIONS</span>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>

            {/* Display Unmatched Learners for addition */}
            <div className="space-y-6">
              {/* Unmatched Advanced Performers */}
              {unmatchedAdvanced.length > 0 ? 
                renderTable(unmatchedAdvanced, "Advanced", "unmatched")
                : 
                <div className="mb-8 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-blue-100 text-blue-800 px-4 py-3">
                    <h4 className="text-md font-semibold">System Recommended Advanced Performers</h4>
                  </div>
                  <div className="bg-white p-6 text-center text-gray-500">
                    All system-identified advanced performers have been added
                  </div>
                </div>
              }
              
              {/* Unmatched Low Performers */}
              {unmatchedSlow.length > 0 ? 
                renderTable(unmatchedSlow, "Slow", "unmatched")
                : 
                <div className="mb-8 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-orange-100 text-orange-800 px-4 py-3">
                    <h4 className="text-md font-semibold">System Recommended Low Performers</h4>
                  </div>
                  <div className="bg-white p-6 text-center text-gray-500">
                    All system-identified low performers have been added
                  </div>
                </div>
              }
            </div>
          </>
        )}
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

export default StudentCOAchievement;