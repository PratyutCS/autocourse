import React, { useState, useEffect } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertTitle, AlertDescription } from "./ui/Alert";

const COAssessmentWeightage = ({
  copoMappingData,
  internalAssessmentData,
  initialWeightages,
  onChange,
  onValidationChange
}) => {
  const [weightages, setWeightages] = useState(initialWeightages || {});
  const [validationErrors, setValidationErrors] = useState([]);
  const [showTip, setShowTip] = useState(true);

  // Transform internal assessment components into array format
  const getAssessmentComponents = () => {
    if (!internalAssessmentData?.components) return [];
    return Object.values(internalAssessmentData.components).map(component => ({
      name: component.component?.trim() || 'Unnamed Assessment',
      weightage: component.weightage
    }));
  };

  // Get course outcomes
  const getCourseOutcomes = () => {
    return Object.keys(copoMappingData?.courseOutcomes || {});
  };

  // Validate column totals (should be 100%)
  const validateWeightages = () => {
    const errors = [];
    const assessments = getAssessmentComponents();
    
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

  // Initialize weightages when component mounts
  useEffect(() => {
    const courseOutcomes = getCourseOutcomes();
    const assessments = getAssessmentComponents();

    // Use initialWeightages if available
    if (initialWeightages && Object.keys(initialWeightages).length > 0) {
      setWeightages(initialWeightages);
      return;
    }

    // Initialize only if no existing data
    const initialWeights = courseOutcomes.reduce((acc, co) => {
      acc[co] = assessments.reduce((assessAcc, assessment) => {
        assessAcc[assessment.name] = '0';
        return assessAcc;
      }, {});
      return acc;
    }, {});

    setWeightages(initialWeights);
    onChange?.(initialWeights);
  }, [copoMappingData, internalAssessmentData, initialWeightages]);

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

  // Calculate column total for a specific assessment component
  const getColumnTotal = (assessmentName) => {
    return Object.values(weightages).reduce((total, coWeightages) => {
      return total + (Number(coWeightages[assessmentName]) || 0);
    }, 0);
  };

  const assessments = getAssessmentComponents();
  const courseOutcomes = getCourseOutcomes();

  return (
    <div>
      <CardContent className="p-6">
        {showTip && (
          <Alert className="bg-blue-50 border-blue-200 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 mt-1 text-blue-600" />
              <div>
                <AlertTitle className="text-blue-800 font-medium mb-2">
                  Allocation Guidance
                </AlertTitle>
                <AlertDescription className="text-sm text-gray-600">
                  For each assessment component (columns), distribute percentage weights across 
                  Course Outcomes (rows) based on how much each assessment contributes to measuring 
                  the CO's attainment. Ensure each column totals 100%. Example: If Quiz 1 primarily 
                  assesses CO1, you might allocate 70% to CO1 and spread the remaining 30% across 
                  other COs it touches.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b border-r border-gray-200 p-3 text-sm font-semibold text-gray-600 text-left min-w-[180px]">
                  Course Outcome
                </th>
                {assessments.map((assessment, index) => (
                  <th 
                    key={index}
                    className="border-b border-r border-gray-200 p-3 text-sm font-semibold text-gray-600 text-left min-w-[150px]"
                  >
                    <div className="flex flex-col">
                      <span>{assessment.name}</span>
                      <span className="text-xs font-normal text-gray-500 mt-1">
                        (Weight: {assessment.weightage}%)
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {courseOutcomes.map((co, index) => (
                <tr 
                  key={co}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="border-b border-r border-gray-200 p-3 font-medium text-gray-700">
                    {co}
                  </td>
                  
                  {assessments.map((assessment, aIndex) => (
                    <td 
                      key={`${co}-${assessment.name}`}
                      className="border-b border-r border-gray-200 p-3"
                    >
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={weightages[co]?.[assessment.name] || "0"}
                          onChange={(e) => handleWeightageChange(co, assessment.name, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white 
                            focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none
                            transition-all text-sm text-gray-700 placeholder-gray-400"
                          placeholder="0-100"
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>

            {/* Footer row for column totals */}
            <tfoot>
              <tr className="bg-gray-50">
                <td className="border-b border-r border-gray-200 p-3 text-sm font-semibold text-gray-600">
                  Column Total
                </td>
                {assessments.map((assessment, index) => (
                  <td
                    key={index}
                    className={`border-b border-r border-gray-200 p-3 font-medium ${
                      getColumnTotal(assessment.name) === 100 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{getColumnTotal(assessment.name)}%</span>
                      {getColumnTotal(assessment.name) !== 100 && (
                        <AlertCircle className="h-4 w-4 ml-2" />
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {validationErrors.length > 0 && (
          <div className="mt-4 space-y-2">
            {validationErrors.map((error, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-md"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default COAssessmentWeightage;