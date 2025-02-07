import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const COAssessmentWeightage = ({
  copoMappingData,
  studentData,
  initialWeightages,
  onChange,
  onValidationChange
}) => {
  const [weightages, setWeightages] = useState(initialWeightages || {});
  const [validationErrors, setValidationErrors] = useState([]);

  // Transform max marks data into assessment components, excluding the last column
  const getAssessmentComponents = () => {
    if (!studentData?.maxMarks) return [];
    
    // Convert maxmarks object to array of entries and remove the last entry
    const entries = Object.entries(studentData.maxMarks);
    const filteredEntries = entries.slice(0, -1); // Exclude the last entry

    return filteredEntries.map(([key, value]) => ({
      id: key,
      name: key.toLowerCase(),
      weightage: value
    }));
  };

  const getCourseOutcomes = () => {
    return Object.keys(copoMappingData?.courseOutcomes || {});
  };

  const validateWeightages = () => {
    const errors = [];
    const assessments = getAssessmentComponents();

    // Check column totals (Assessment totals)
    assessments.forEach(assessment => {
      const total = getColumnTotal(assessment.name);
      if (total !== 100) {
        errors.push(`${assessment.name} weightages sum to ${total}% (should be 100%)`);
      }
    });

    setValidationErrors(errors);
    onValidationChange?.(errors.length === 0);
    return errors.length === 0;
  };

  useEffect(() => {
    validateWeightages();
  }, [weightages]);

  useEffect(() => {
    const courseOutcomes = getCourseOutcomes();
    const assessments = getAssessmentComponents();

    const newWeightages = {};

    courseOutcomes.forEach(co => {
      newWeightages[co] = {};
      assessments.forEach(assessment => {
        const existingValue = weightages[co]?.[assessment.name];
        const initialValue = initialWeightages?.[co]?.[assessment.name];

        newWeightages[co][assessment.name] =
          (existingValue !== undefined ? existingValue :
            initialValue !== undefined ? initialValue :
              "0").toString();
      });
    });

    if (JSON.stringify(weightages) !== JSON.stringify(newWeightages)) {
      setWeightages(newWeightages);
      onChange?.(newWeightages);
    }
  }, [copoMappingData, studentData, initialWeightages]);

  const handleWeightageChange = (co, assessmentName, value) => {
    const numValue = Math.min(100, Math.max(0, Number(value) || 0));

    const newWeightages = {
      ...weightages,
      [co]: {
        ...weightages[co],
        [assessmentName]: numValue.toString()
      }
    };

    setWeightages(newWeightages);
    onChange?.(newWeightages);
  };

  const getColumnTotal = (assessmentName) => {
    return Object.values(weightages).reduce((total, coWeightages) => {
      return total + (Number(coWeightages[assessmentName]) || 0);
    }, 0);
  };

  const getRowTotal = (co) => {
    return Object.values(weightages[co] || {}).reduce((total, value) => {
      return total + (Number(value) || 0);
    }, 0);
  };

  const assessments = getAssessmentComponents();
  const courseOutcomes = getCourseOutcomes();

  if (!courseOutcomes.length || !assessments.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
            9
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            CO Assessment Weightage Matrix
          </h2>
        </div>
        
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg">
            Missing Required Data
          </p>
          <div className="text-sm text-gray-500 mt-2 space-y-2">
            {!courseOutcomes.length && (
              <p>• No Course Outcomes found in CO-PO mapping data</p>
            )}
            {!assessments.length && (
              <p>• No Assessment Data found in student data</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
          9
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          CO Assessment Weightage Matrix
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CO / Assessment
              </th>
              {assessments.map((assessment) => (
                <th
                  key={assessment.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {assessment.name}
                  <div className="text-xs text-gray-400 normal-case">
                    (Max Marks: {assessment.weightage})
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {courseOutcomes.map((co) => (
              <tr key={co}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{co}</div>
                </td>
                {assessments.map((assessment) => (
                  <td key={`${co}_${assessment.name}`} className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={weightages[co]?.[assessment.name] || "0"}
                      onChange={(e) => handleWeightageChange(co, assessment.name, e.target.value)}
                      className={`w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB255]/20 focus:border-[#FFB255] ${
                        weightages[co]?.[assessment.name] !== initialWeightages?.[co]?.[assessment.name]
                          ? 'border-amber-300 bg-amber-50'
                          : 'border-gray-300'
                      }`}
                    />
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getRowTotal(co)}%
                </td>
              </tr>
            ))}

            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total
              </td>
              {assessments.map((assessment) => (
                <td key={`total_${assessment.name}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getColumnTotal(assessment.name)}%
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" />
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2">
        {validationErrors.map((error, index) => (
          <p key={index} className="text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </p>
        ))}
      </div>
    </div>
  );
};

export default COAssessmentWeightage;