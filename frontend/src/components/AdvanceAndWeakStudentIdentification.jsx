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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 
  // Instead of immediately filtering or merging data, we'll rely on learnerCategories directly
  // if it's present in the new format. If needed, we only calculate from scratch if there's no data.
  //
  useEffect(() => {
    if (!learnerCategories && coWeightages && studentData && coAttainmentCriteria) {
      // If no saved data at all, only then calculate
      calculateStudentAchievement();
    }
  }, [learnerCategories, coWeightages, studentData, coAttainmentCriteria]);

  const calculateStudentAchievement = () => {
    setLoading(true);
    try {
      const performanceData = [];
      const cos = Object.keys(coWeightages || {});
      
      if (studentData?.maxMarks && studentData?.data) {
        const assessmentComponents = Object.entries(studentData.maxMarks).slice(0, -1);

        studentData.data.forEach((student, index) => {
          const studentResult = {
            id: student['Unique Id.'],
            rollNumber: student['Student Name'] || `Student ${index + 1}`,
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
      console.error('Error in calculateStudentAchievement:', err);
      setError('Failed to calculate student achievement data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = (student) => {
    setStudentToRemove(student);
    setShowConfirmation(true);
  };

  const confirmRemoval = () => {
    if (studentToRemove && onSave) {
      // Filter out the removed student from advanced/medium/slow
      const updatedData = { advancedLearners: [], mediumLearners: [], slowLearners: [] };
      if (learnerCategories?.advancedLearners) {
        updatedData.advancedLearners = learnerCategories.advancedLearners.filter(
          (s) => s.id !== studentToRemove.id
        );
      }
      if (learnerCategories?.mediumLearners) {
        updatedData.mediumLearners = learnerCategories.mediumLearners.filter(
          (s) => s.id !== studentToRemove.id
        );
      }
      if (learnerCategories?.slowLearners) {
        updatedData.slowLearners = learnerCategories.slowLearners.filter(
          (s) => s.id !== studentToRemove.id
        );
      }
      onSave(updatedData);
      setStudentToRemove(null);
      setShowConfirmation(false);
    }
  };

  const cancelRemoval = () => {
    setShowConfirmation(false);
    setStudentToRemove(null);
  };

  const getStudentType = (student) => {
    const coScores = Object.values(student.coScores || {});
    if (coScores.every(score => score === 3)) return 'Advanced';
    if (coScores.every(score => score === 1)) return 'Weak';
    return 'Regular';
  };

  //
  // Rendering
  //
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

  // If learnerCategories is in the new format, display advanced, medium, and slow
  const advancedLearners = learnerCategories?.advancedLearners || [];
  const mediumLearners = learnerCategories?.mediumLearners || [];
  const slowLearners = learnerCategories?.slowLearners || [];

  // If there's a data array (old format), you could display it directly, e.g.:
  const rawData = learnerCategories?.data || [];

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

      {/* Display categories directly */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Advanced Learners</h3>
        {advancedLearners.length < 1 ? (
          <p className="text-sm text-gray-600">No advanced learners found.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full border-collapse">
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
                {advancedLearners.map(student => (
                  <tr key={student.id} className="bg-blue-50 hover:bg-blue-100">
                    <td className="border border-gray-200 p-3">
                      {student.rollNumber}
                    </td>
                    {Object.keys(coWeightages || {}).map(co => (
                      <td key={`${student.id}-${co}`} className="border border-gray-200 p-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                          {student.coScores?.[co]}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Medium Learners</h3>
        {mediumLearners.length < 1 ? (
          <p className="text-sm text-gray-600">No medium learners found.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full border-collapse">
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
                {mediumLearners.map(student => (
                  <tr key={student.id} className="hover:bg-gray-100">
                    <td className="border border-gray-200 p-3">
                      {student.rollNumber}
                    </td>
                    {Object.keys(coWeightages || {}).map(co => (
                      <td key={`${student.id}-${co}`} className="border border-gray-200 p-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                          {student.coScores?.[co]}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Slow Learners</h3>
        {slowLearners.length < 1 ? (
          <p className="text-sm text-gray-600">No slow learners found.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full border-collapse">
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
                {slowLearners.map(student => (
                  <tr key={student.id} className="bg-orange-50 hover:bg-orange-100">
                    <td className="border border-gray-200 p-3">
                      {student.rollNumber}
                    </td>
                    {Object.keys(coWeightages || {}).map(co => (
                      <td key={`${student.id}-${co}`} className="border border-gray-200 p-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 border border-orange-300">
                          {student.coScores?.[co]}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Show the raw array data (if it exists) */}
      {rawData.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-2">Raw Learner Data</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  {Object.keys(rawData[0]).map((key) => (
                    <th
                      key={key}
                      className="bg-gray-50 border border-gray-200 p-3 font-semibold text-gray-700 text-sm whitespace-nowrap"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rawData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(item).map((val, idx) => (
                      <td
                        key={idx}
                        className="border border-gray-200 p-3 text-gray-700 text-sm whitespace-nowrap"
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Confirmation Popup */}
      {showConfirmation && studentToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Confirm Removal</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove <span className="font-medium">{studentToRemove.rollNumber}</span> 
              from the {getStudentType(studentToRemove)} Learner list?
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