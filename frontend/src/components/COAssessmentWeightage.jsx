import React, { useState, useEffect } from 'react';
import { AlertCircle, Info } from 'lucide-react';

const COAssessmentWeightage = ({
  copoMappingData,
  studentData,
  initialWeightages,
  onChange,
  onValidationChange
}) => {
  const [weightages, setWeightages] = useState(initialWeightages || {});
  const [inputValues, setInputValues] = useState({}); // For tracking user inputs
  const [validationErrors, setValidationErrors] = useState([]);
  const [focusedField, setFocusedField] = useState(null);

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
    const newInputValues = {};

    courseOutcomes.forEach(co => {
      newWeightages[co] = {};
      newInputValues[co] = {};

      assessments.forEach(assessment => {
        const existingValue = weightages[co]?.[assessment.name];
        const initialValue = initialWeightages?.[co]?.[assessment.name];

        const numericValue =
          existingValue !== undefined ? existingValue :
            initialValue !== undefined ? initialValue :
              "0";

        newWeightages[co][assessment.name] = numericValue;
        newInputValues[co][assessment.name] = numericValue;
      });
    });

    if (JSON.stringify(weightages) !== JSON.stringify(newWeightages)) {
      setWeightages(newWeightages);
      setInputValues(newInputValues);
      onChange?.(newWeightages);
    }
  }, [copoMappingData, studentData, initialWeightages]);

  const handleInputChange = (co, assessmentName, value) => {
    // Allow empty string during typing
    const newInputValues = {
      ...inputValues,
      [co]: {
        ...inputValues[co],
        [assessmentName]: value
      }
    };
    setInputValues(newInputValues);

    // If the value is a valid number, update the weightages too
    if (value !== '' && !isNaN(Number(value))) {
      const numValue = Math.min(100, Math.max(0, Number(value)));

      const newWeightages = {
        ...weightages,
        [co]: {
          ...weightages[co],
          [assessmentName]: numValue.toString()
        }
      };

      setWeightages(newWeightages);
      onChange?.(newWeightages);
    } else if (value === '') {
      // When the value is empty, set weightage to 0 but keep display empty
      const newWeightages = {
        ...weightages,
        [co]: {
          ...weightages[co],
          [assessmentName]: "0"
        }
      };

      setWeightages(newWeightages);
      onChange?.(newWeightages);
    }
  };

  const handleBlur = (co, assessmentName, value) => {
    const numValue = value === '' ? 0 : Math.min(100, Math.max(0, Number(value) || 0));

    // Update both input values and weightages with the validated number
    const newInputValues = {
      ...inputValues,
      [co]: {
        ...inputValues[co],
        [assessmentName]: numValue.toString()
      }
    };

    const newWeightages = {
      ...weightages,
      [co]: {
        ...weightages[co],
        [assessmentName]: numValue.toString()
      }
    };

    setInputValues(newInputValues);
    setWeightages(newWeightages);
    onChange?.(newWeightages);
    setFocusedField(null);
  };

  const getColumnTotal = (assessmentName) => {
    return Object.values(weightages).reduce((total, coWeightages) => {
      return total + (Number(coWeightages[assessmentName]) || 0);
    }, 0);
  };

  // Updated getRowTotal:
  // Instead of showing the raw sum, we divide by (100 * number of assessments)
  // to normalize it, then multiply by 100 to show as a percentage.
  // This is equivalent to taking the average percentage for that row.
  const getRowTotal = (co) => {
    const total = Object.values(weightages[co] || {}).reduce((sum, value) => {
      return sum + (Number(value) || 0);
    }, 0);
    const assessmentsCount = getAssessmentComponents().length;
    // Calculate normalized percentage: (total / (100 * assessmentsCount)) * 100 === total / assessmentsCount
    const normalized = total / assessmentsCount;
    return normalized.toFixed(2);
  };

  const getColumnClass = (assessmentName) => {
    const total = getColumnTotal(assessmentName);
    return total === 100 ? 'text-green-600 font-medium' : 'text-red-600 font-medium';
  };

  const assessments = getAssessmentComponents();
  const courseOutcomes = getCourseOutcomes();

  if (!courseOutcomes.length || !assessments.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
           CO
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            CO Assessment Weightage Matrix
          </h2>
        </div>

        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
          CO
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          CO Assessment Weightage Matrix
        </h2>
      </div>

      {/* Allocation Guidance Message */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <span className="font-semibold">Allocation Guidance:</span>
          <p>
            For each assessment component (columns), distribute percentage weights across Course Outcomes (rows) based on how much each assessment contributes to measuring the CO's attainment. Ensure each column totals 100%. Example: If Quiz 1 primarily assesses CO1, you might allocate 70% to CO1 and spread the remaining 30% across other COs it touches.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto border border-black/10 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                CO / Assessment
              </th>
              {assessments.map((assessment) => (
                <th
                  key={assessment.id}
                  className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-r border-gray-200"
                >
                  <div className="flex flex-col">
                    <span>{assessment.name}</span>
                    <span className="text-xs font-normal text-gray-500 normal-case mt-1">
                      Max Marks: {assessment.weightage}
                    </span>
                  </div>
                </th>
              ))}
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Weightages
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {courseOutcomes.map((co, rowIndex) => (
              <tr key={co} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                  <div className="text-sm font-medium text-gray-800">{co}</div>
                </td>
                {assessments.map((assessment) => (
                  <td key={`${co}_${assessment.name}`} className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={inputValues[co]?.[assessment.name] || ""}
                        onChange={(e) => handleInputChange(co, assessment.name, e.target.value)}
                        onFocus={() => setFocusedField(`${co}_${assessment.name}`)}
                        onBlur={(e) => handleBlur(co, assessment.name, e.target.value)}
                        className={`w-20 px-3 py-2 border rounded-md transition-all duration-200
                          ${focusedField === `${co}_${assessment.name}`
                            ? 'border-[#FFB255] ring-2 ring-[#FFB255] ring-opacity-20'
                            : inputValues[co]?.[assessment.name] !== initialWeightages?.[co]?.[assessment.name]
                              ? 'border-amber-300 bg-amber-50 hover:border-amber-400'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                      />
                    </div>
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-700">
                    {getRowTotal(co)}%
                  </div>
                </td>
              </tr>
            ))}

            <tr className="bg-gray-100 border-t-2 border-gray-300">
              <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                <div className="text-sm font-semibold text-gray-800">Total</div>
              </td>
              {assessments.map((assessment) => {
                const total = getColumnTotal(assessment.name);
                return (
                  <td
                    key={`total_${assessment.name}`}
                    className="px-6 py-4 whitespace-nowrap border-r border-gray-200"
                  >
                    <div className={`text-sm ${getColumnClass(assessment.name)}`}>
                      {total}%
                    </div>
                  </td>
                );
              })}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg space-y-2">
          <div className="font-medium text-red-800 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Validation Error(s)
          </div>
          {validationErrors.map((error, index) => (
            <p key={index} className="text-sm text-red-700 ml-7">
              • {error}
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Note: Each assessment column should sum to exactly 100%.
      </div>
    </div>
  );
};

export default COAssessmentWeightage;
