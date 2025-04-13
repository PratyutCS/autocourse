import React, { useState, useEffect } from 'react';
import { AlertCircle, Trash2, Plus, Search, ChevronDown, ChevronUp, Check, Square, CheckSquare } from 'lucide-react';

const AdvanceAndWeakStudentIdentification = ({
  coWeightages,
  studentData,
  coAttainmentCriteria,
  learnerCategories,
  onSave 
}) => {
  // Keep existing state variables
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [systemIdentified, setSystemIdentified] = useState({ advanced: [], weak: [] });
  const [localLearnerCategories, setLocalLearnerCategories] = useState([[], []]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  
  // Add new state variables for enhanced UI
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    advancedLearners: true,
    weakLearners: true,
    unmatchedAdvanced: true,
    unmatchedWeak: true
  });
  
  // Add state for multiple selection
  const [selectedStudents, setSelectedStudents] = useState({
    advanced: [],
    weak: [],
    unmatchedAdvanced: [],
    unmatchedWeak: []
  });
  
  // Keep existing useEffect and calculation functions
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

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Filter students based on search term
  const filterStudents = (students) => {
    if (!searchTerm) return students;
    return students.filter(student => 
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Compute unmatched learners.
  const unmatchedAdvanced = systemIdentified.advanced.filter(
    student => !localLearnerCategories[0].some(s => s.id === student.id)
  );
  const unmatchedWeak = systemIdentified.weak.filter(
    student => !localLearnerCategories[1].some(s => s.id === student.id)
  );

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
    const selectedIds = selectedStudents[categoryType === "Advanced" ? "unmatchedAdvanced" : "unmatchedWeak"];
    const studentsToAdd = students.filter(student => selectedIds.includes(student.id));
    
    let updatedCategories = [...localLearnerCategories];
    if (categoryType === "Advanced") {
      const uniqueStudents = studentsToAdd.filter(
        student => !updatedCategories[0].some(s => s.id === student.id)
      );
      updatedCategories[0] = [...updatedCategories[0], ...uniqueStudents];
    } else if (categoryType === "Weak") {
      const uniqueStudents = studentsToAdd.filter(
        student => !updatedCategories[1].some(s => s.id === student.id)
      );
      updatedCategories[1] = [...updatedCategories[1], ...uniqueStudents];
    }
    
    setLocalLearnerCategories(updatedCategories);
    if (onSave) {
      onSave(updatedCategories);
    }
    
    // Clear selection after adding
    setSelectedStudents(prev => ({
      ...prev,
      [categoryType === "Advanced" ? "unmatchedAdvanced" : "unmatchedWeak"]: []
    }));
  };

  // Bulk remove selected students
  const bulkRemoveStudents = (categoryType) => {
    const selectedIds = selectedStudents[categoryType === "Advanced" ? "advanced" : "weak"];
    
    let updatedCategories = [...localLearnerCategories];
    if (categoryType === "Advanced") {
      updatedCategories[0] = updatedCategories[0].filter(s => !selectedIds.includes(s.id));
    } else if (categoryType === "Weak") {
      updatedCategories[1] = updatedCategories[1].filter(s => !selectedIds.includes(s.id));
    }
    
    setLocalLearnerCategories(updatedCategories);
    if (onSave) {
      onSave(updatedCategories);
    }
    
    // Clear selection after removing
    setSelectedStudents(prev => ({
      ...prev,
      [categoryType === "Advanced" ? "advanced" : "weak"]: []
    }));
  };

  // Improved table rendering function with fixed headers and scrollable body
  const renderTable = (students, categoryType, mode = "local") => {
    const filteredStudents = filterStudents(students);
    const totalColumns = Object.keys(coWeightages).length + 3; // Added one for checkbox
    const category = categoryType === "Advanced" 
      ? (mode === "local" ? "advanced" : "unmatchedAdvanced") 
      : (mode === "local" ? "weak" : "unmatchedWeak");
    
    const isAllSelected = filteredStudents.length > 0 && 
      filteredStudents.every(student => 
        selectedStudents[category].includes(student.id)
      );
    
    const borderColor = categoryType === "Advanced" ? "border-amber-400" : "border-gray-300";
    
    return (
      <div className={`border ${borderColor} rounded-lg shadow-sm overflow-hidden mb-6`}>
        <div className={`bg-white py-3 px-4 border-b ${borderColor}`}>
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-800">
              {categoryType} Learners ({filteredStudents.length})
            </h4>
            {mode === "local" && filteredStudents.length > 0 && (
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                User Categorized
              </span>
            )}
            {mode === "unmatched" && filteredStudents.length > 0 && (
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                System Identified
              </span>
            )}
          </div>
        </div>
        
        {filteredStudents.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 text-gray-500">
            No {categoryType.toLowerCase()} performers found
          </div>
        ) : (
          <>
            {/* Bulk actions */}
            {selectedStudents[category].length > 0 && (
              <div className="bg-gray-50 border-b border-gray-200 p-3 flex justify-between items-center">
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
              <div className="overflow-y-auto max-h-96">
                <table className="min-w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th className="bg-gray-50 border-b border-gray-200 p-3 font-semibold text-gray-700 text-sm text-left w-10">
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
                      <th className="bg-gray-50 border-b border-gray-200 p-3 font-semibold text-gray-700 text-sm text-left">
                        NAME
                      </th>
                      {Object.keys(coWeightages || {}).map(co => (
                        <th key={co} className="bg-gray-50 border-b border-gray-200 p-3 font-semibold text-gray-700 text-sm text-center">
                          {co} Score
                        </th>
                      ))}
                      <th className="bg-gray-50 border-b border-gray-200 p-3 font-semibold text-gray-700 text-sm text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => {
                      const isEven = index % 2 === 0;
                      const isSelected = selectedStudents[category].includes(student.id);
                      
                      return (
                        <tr key={student.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-amber-50' : isEven ? 'bg-white' : 'bg-gray-50'}`}>
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
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${categoryType === "Advanced" ? "bg-amber-400" : "bg-gray-400"}`}></div>
                              {student.rollNumber}
                            </div>
                          </td>
                          {Object.keys(coWeightages || {}).map(co => (
                            <td key={`${student.id}_${co}`} className="border-b border-gray-200 p-3 text-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full 
                                ${student.coScores[co] === 3 ? 'bg-white text-amber-700 border border-amber-400' : 
                                  student.coScores[co] === 1 ? 'bg-white text-gray-600 border border-gray-300' : 
                                  'bg-white text-gray-700 border border-gray-300'}`}>
                                {student.coScores[co]}
                              </span>
                            </td>
                          ))}
                          <td className="border-b border-gray-200 p-3 text-center">
                            {mode === "local" ? (
                              <button 
                                onClick={() => handleRemoveClick(student, categoryType)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
                                title={`Remove from ${categoryType} Learner list`}
                              >
                                <Trash2 className="w-5 h-5 text-gray-500" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => addLearner(student, categoryType)}
                                className="p-2 rounded-full hover:bg-amber-50 transition-colors duration-200 focus:outline-none"
                                title={`Add to ${categoryType} Learner list`}
                              >
                                <Plus className="w-5 h-5 text-gray-600" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Render section with collapsible header
  const renderSection = (title, icon, section, content) => {
    return (
      <div className="mb-6">
        <div 
          className="flex justify-between items-center bg-white p-4 rounded-t-lg cursor-pointer border border-amber-400 border-b-0"
          onClick={() => toggleSection(section)}
        >
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
          {expandedSections[section] ? 
            <ChevronUp className="w-5 h-5 text-gray-600" /> : 
            <ChevronDown className="w-5 h-5 text-gray-600" />
          }
        </div>
        
        {expandedSections[section] && (
          <div className="border border-amber-400 rounded-b-lg p-4 bg-white">
            {content}
          </div>
        )}
      </div>
    );
  };

  if (!coWeightages || !studentData || !coAttainmentCriteria) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-400 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="section-number bg-white text-amber-500 rounded-full w-8 h-8 flex items-center justify-center border border-amber-400">
            18
          </div>
          <h2 className="section-title text-xl font-semibold text-gray-800">
            Advanced &amp; Weak Students
          </h2>
        </div>
        <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-400 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="section-number bg-white text-amber-500 rounded-full w-8 h-8 flex items-center justify-center border border-amber-400">
            18
          </div>
          <h2 className="section-title text-xl font-semibold text-gray-800">
           Identification of Advanced learner and low performer conducted at the end of the semester
          </h2>
        </div>
        <div className="text-center py-10">
          <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Analyzing student performance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-400 mt-8">
        <div className="flex items-center gap-4 mb-6">
        <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              18
            </div>
          <h2 className="section-title text-xl font-semibold text-gray-800">
          Identification of Advanced learner and low performer conducted at the end of the semester
          </h2>
        </div>
        <div className="text-center py-10">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-amber-500 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
        <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              18
            </div>
          <h2 className="section-title text-xl font-semibold text-gray-800">
          Identification of Advanced learner and low performer conducted at the end of the semester
          </h2>
        </div>
        
        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-64"
          />
        </div>
      </div>
      
      {/* Student Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-amber-400 rounded-lg p-4">
          <h4 className="text-gray-700 font-medium mb-1">Advanced Learners</h4>
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold text-gray-800">{localLearnerCategories[0].length}</p>
            <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {((localLearnerCategories[0].length / studentPerformance.length) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <h4 className="text-gray-700 font-medium mb-1">Low Performers</h4>
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold text-gray-800">{localLearnerCategories[1].length}</p>
            <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {((localLearnerCategories[1].length / studentPerformance.length) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-gray-700 font-medium mb-1">Total Students</h4>
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold text-gray-800">{studentPerformance.length}</p>
            <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {studentPerformance.length} enrolled
            </div>
          </div>
        </div>
      </div>
      
      {/* Learner Categories Section */}
      {renderSection(
        "Learner Categories", 
        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-amber-500 text-xs font-bold border border-amber-400">L</div>,
        "learnerCategories",
        <>
          <div className="mb-4">
            {renderTable(localLearnerCategories[0], "Advanced", "local")}
          </div>
          <div>
            {renderTable(localLearnerCategories[1], "Weak", "local")}
          </div>
        </>
      )}
      
      {/* Unmatched Learners Section */}
      {renderSection(
        "System Identified Learners", 
        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-amber-500 text-xs font-bold border border-amber-400">S</div>,
        "unmatchedLearners",
        <>
          <div className="mb-4">
            {renderTable(unmatchedAdvanced, "Advanced", "unmatched")}
          </div>
          <div>
            {renderTable(unmatchedWeak, "Weak", "unmatched")}
          </div>
        </>
      )}

      {/* Legend */}
      <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-white">
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

export default AdvanceAndWeakStudentIdentification;