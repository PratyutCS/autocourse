import React, { useState, useEffect } from 'react';
import { Trash2, Plus, ArrowUpDown, Search, CheckSquare, Square } from 'lucide-react';

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
  const [localLearnerCategories, setLocalLearnerCategories] = useState([[], []]);
  // States for removal confirmation popup.
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  // State for sorting
  const [sortConfig, setSortConfig] = useState({ key: 'rowAverage', direction: 'desc' });
  // State for multiple selection
  const [selectedStudents, setSelectedStudents] = useState({
    advanced: [],
    slow: [],
    unmatchedAdvanced: [],
    unmatchedSlow: []
  });

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

  // Select/deselect all students in a category
  const handleSelectAll = (students, category) => {
    if (selectedStudents[category].length === students.length) {
      // If all are selected, deselect all
      setSelectedStudents(prev => ({
        ...prev,
        [category]: []
      }));
    } else {
      // Select all
      setSelectedStudents(prev => ({
        ...prev,
        [category]: students.map(student => student.id)
      }));
    }
  };

  // Toggle selection of a single student
  const toggleStudentSelection = (studentId, category) => {
    setSelectedStudents(prev => {
      const updatedSelection = [...prev[category]];
      const index = updatedSelection.indexOf(studentId);
      
      if (index === -1) {
        updatedSelection.push(studentId);
      } else {
        updatedSelection.splice(index, 1);
      }
      
      return {
        ...prev,
        [category]: updatedSelection
      };
    });
  };

  // Bulk add selected students
  const bulkAddStudents = (students, categoryType) => {
    const category = categoryType === "Advanced" ? "unmatchedAdvanced" : "unmatchedSlow";
    const selectedIds = selectedStudents[category];
    const studentsToAdd = students.filter(student => selectedIds.includes(student.id));
    
    let updatedCategories = [...localLearnerCategories];
    if (categoryType === "Advanced") {
      const uniqueStudents = studentsToAdd.filter(
        student => !updatedCategories[0].some(s => s.id === student.id)
      );
      updatedCategories[0] = [...updatedCategories[0], ...uniqueStudents];
    } else if (categoryType === "Slow") {
      const uniqueStudents = studentsToAdd.filter(
        student => !updatedCategories[1].some(s => s.id === student.id)
      );
      updatedCategories[1] = [...updatedCategories[1], ...uniqueStudents];
    }
    
    setLocalLearnerCategories(updatedCategories);
    if (onSave) onSave(updatedCategories);
    
    // Clear selection after adding
    setSelectedStudents(prev => ({
      ...prev,
      [category]: []
    }));
  };

  // Bulk remove selected students
  const bulkRemoveStudents = (categoryType) => {
    const category = categoryType === "Advanced" ? "advanced" : "slow";
    const selectedIds = selectedStudents[category];
    
    let updatedCategories = [...localLearnerCategories];
    if (categoryType === "Advanced") {
      updatedCategories[0] = updatedCategories[0].filter(s => !selectedIds.includes(s.id));
    } else if (categoryType === "Slow") {
      updatedCategories[1] = updatedCategories[1].filter(s => !selectedIds.includes(s.id));
    }
    
    setLocalLearnerCategories(updatedCategories);
    if (onSave) onSave(updatedCategories);
    
    // Clear selection after removing
    setSelectedStudents(prev => ({
      ...prev,
      [category]: []
    }));
  };

  // Render table for a given list of learners.
  // mode "local" for learners already in localLearnerCategories, "unmatched" for those that can be added.
  const renderTable = (students, categoryType, mode = "local") => {
    const relevantCOs = getRelevantCOs();
    const filteredStudents = filterStudents(students);
    const sortedStudents = sortStudents(filteredStudents);
    const category = categoryType === "Advanced" 
      ? (mode === "local" ? "advanced" : "unmatchedAdvanced") 
      : (mode === "local" ? "slow" : "unmatchedSlow");
    
    const isAllSelected = filteredStudents.length > 0 && 
      filteredStudents.every(student => 
        selectedStudents[category].includes(student.id)
      );
    
    const borderColor = categoryType === "Advanced" ? "border-amber-400" : "border-gray-300";
    
    return (
      <div className={`mb-8 border ${borderColor} rounded-lg shadow-sm overflow-hidden`}>
        <div className={`bg-white text-gray-800 px-4 py-3 flex justify-between items-center border-b ${borderColor}`}>
          <h4 className="text-md font-semibold">{categoryType} Performers</h4>
          <div className="flex items-center">
            <div className="px-3 py-1 rounded-full text-sm bg-gray-100">
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
          
          {/* Bulk actions */}
          {selectedStudents[category].length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4 flex justify-between items-center">
              <span className="text-gray-700 font-medium text-sm">
                {selectedStudents[category].length} students selected
              </span>
              {mode === "local" ? (
                <button 
                  onClick={() => bulkRemoveStudents(categoryType)}
                  className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
                >
                  Remove Selected
                </button>
              ) : (
                <button 
                  onClick={() => bulkAddStudents(filteredStudents, categoryType)}
                  className="px-3 py-1 bg-white border border-amber-400 text-gray-700 rounded-md text-sm hover:bg-amber-50"
                >
                  Add Selected
                </button>
              )}
            </div>
          )}
          
          <div className="overflow-x-auto">
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="min-w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-3 text-left font-semibold text-gray-700 text-sm w-10">
                      <div 
                        className="cursor-pointer inline-flex items-center"
                        onClick={() => handleSelectAll(filteredStudents, category)}
                      >
                        {isAllSelected ? (
                          <CheckSquare className="w-5 h-5 text-amber-500" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </th>
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
                    sortedStudents.map(student => {
                      const isSelected = selectedStudents[category].includes(student.id);
                      return (
                        <tr key={student.id} className={`${isSelected ? 'bg-amber-50' : ''} hover:bg-gray-50 transition-colors duration-200`}>
                          <td className="border-b border-gray-200 p-3">
                            <div 
                              className="cursor-pointer"
                              onClick={() => toggleStudentSelection(student.id, category)}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-amber-500" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="border-b border-gray-200 p-3 font-medium">
                            {student.rollNumber}
                          </td>
                          {relevantCOs.map(co => (
                            <td key={`${student.id}_${co}`} className="border-b border-gray-200 p-3 text-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full 
                                ${student.coScores[co] === 3 ? 'bg-white text-amber-700 border border-amber-400' : 
                                  student.coScores[co] === 1 ? 'bg-white text-gray-600 border border-gray-300' : 
                                  'bg-white text-gray-700 border border-gray-300'}`}>
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
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                title={`Remove from ${categoryType} Learner list`}
                              >
                                <Trash2 className="w-5 h-5 text-gray-600" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => addLearner(student, categoryType)}
                                className="p-2 rounded-full hover:bg-amber-50 transition-colors duration-200"
                                title={`Add to ${categoryType} Learner list`}
                              >
                                <Plus className="w-5 h-5 text-gray-600" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={relevantCOs.length + 4} className="text-center py-6 text-gray-500 bg-gray-50">
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
    <div>
      
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
                <div className="mb-8 border border-amber-400 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-white text-gray-800 px-4 py-3 border-b border-amber-400">
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
                <div className="mb-8 border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-white text-gray-800 px-4 py-3 border-b border-gray-300">
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
                <div className="mb-8 border border-amber-400 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-white text-gray-800 px-4 py-3 border-b border-amber-400">
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
                <div className="mb-8 border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-white text-gray-800 px-4 py-3 border-b border-gray-300">
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
      
      {/* Performance Indicators Legend */}
      <div className="mx-6 mb-6 p-4 border border-gray-200 rounded-lg bg-white">
        <h3 className="text-base font-semibold mb-2">Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
            <span className="inline-block w-8 h-8 mr-3 bg-white text-amber-700 border border-amber-400 rounded-full flex items-center justify-center font-medium">3</span>
            <div>
              <span className="text-gray-700 font-medium">Advanced Performance</span>
              <p className="text-xs text-gray-500 mt-1">Full attainment in CO</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
            <span className="inline-block w-8 h-8 mr-3 bg-white text-gray-700 border border-gray-300 rounded-full flex items-center justify-center font-medium">2</span>
            <div>
              <span className="text-gray-700 font-medium">Regular Performance</span>
              <p className="text-xs text-gray-500 mt-1">Partial attainment in CO</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
            <span className="inline-block w-8 h-8 mr-3 bg-white text-gray-700 border border-gray-300 rounded-full flex items-center justify-center font-medium">1</span>
            <div>
              <span className="text-gray-700 font-medium">Low Performance</span>
              <p className="text-xs text-gray-500 mt-1">No attainment in CO</p>
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
                className="px-4 py-2 bg-white border border-amber-400 text-gray-800 rounded-md hover:bg-amber-50 transition-colors duration-200"
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