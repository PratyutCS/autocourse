import React, { useState, useEffect } from 'react';

const TargetAttainment = ({ copoMappingData, initialCriteria, onSave }) => {
  const [criteria, setCriteria] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });

  // Clamp the value between 0 and 100
  const clampValue = (value) => {
    if (value === '') return 0;
    let num = Number(value);
    if (isNaN(num)) return 0;
    if (num < 0) num = 0;
    if (num > 100) num = 100;
    return num;
  };

  useEffect(() => {
    const initialData = initialCriteria || {};
    const newCriteria = {};

    // Initialize only for existing COs and use clamped values
    Object.keys(copoMappingData.courseOutcomes).forEach((co) => {
      newCriteria[co] = {
        full: clampValue(initialData[co]?.full || 0),
        partial: clampValue(initialData[co]?.partial || 0),
      };
    });

    if (JSON.stringify(criteria) !== JSON.stringify(newCriteria)) {
      setCriteria(newCriteria);
      onSave(newCriteria);
    }
  }, [copoMappingData, initialCriteria]);

  const handleChange = (co, type, value) => {
    // Allow empty input while typing
    const newCriteria = {
      ...criteria,
      [co]: {
        ...criteria[co],
        [type]: value,
      },
    };
    setCriteria(newCriteria);
  };

  const handleBlur = (co, type, value) => {
    const numericValue = clampValue(value);
    
    // Show toast if value was clamped
    if (value !== '' && Number(value) !== numericValue) {
      if (Number(value) > 100) {
        showToast('Value has been capped at 100%');
      } else if (Number(value) < 0) {
        showToast('Value has been set to 0%');
      }
    }
    
    const newCriteria = {
      ...criteria,
      [co]: {
        ...criteria[co],
        [type]: numericValue,
      },
    };
    
    setCriteria(newCriteria);
    onSave(newCriteria);
    setFocusedField(null);
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200  relative">
      {/* Toast notification */}
      {toast.show && (
        <div className="absolute top-4 right-4 bg-[#FFB255] text-white px-4 py-2 rounded-md shadow-md animate-fade-in z-10 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
          T
        </div>
        <h2 className="section-title text-xl font-semibold">
          Target Attainment
        </h2>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        Set the minimum percentage of students required to achieve full and partial attainment for each course outcome.
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="bg-gray-50 border border-gray-200 p-3 font-semibold text-gray-700 text-sm">
                Criteria
              </th>
              {Object.keys(copoMappingData.courseOutcomes).map((co) => (
                <th key={co} className="bg-gray-50 border border-gray-200 p-3 font-semibold text-gray-700 text-sm">
                  {co} <span className="text-gray-500 font-normal">(in %)</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 p-3 text-sm text-gray-600 font-medium bg-gray-50">
                Min. % students (fully attained)
              </td>
              {Object.keys(copoMappingData.courseOutcomes).map((co) => (
                <td key={`${co}-full`} className="border border-gray-200 p-3">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className={`w-full p-2 border rounded-md transition-all duration-200 ${
                        focusedField === `${co}-full` 
                          ? 'border-[#FFB255] ring-2 ring-[#FFB255] ring-opacity-20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      value={criteria[co]?.full !== undefined ? criteria[co]?.full : ''}
                      onChange={(e) => handleChange(co, 'full', e.target.value)}
                      onFocus={() => setFocusedField(`${co}-full`)}
                      onBlur={(e) => handleBlur(co, 'full', e.target.value)}
                    />
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="border border-gray-200 p-3 text-sm text-gray-600 font-medium bg-gray-50">
                Min. % students (partially attained)
              </td>
              {Object.keys(copoMappingData.courseOutcomes).map((co) => (
                <td key={`${co}-partial`} className="border border-gray-200 p-3">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className={`w-full p-2 border rounded-md transition-all duration-200 ${
                        focusedField === `${co}-partial` 
                          ? 'border-[#FFB255] ring-2 ring-[#FFB255] ring-opacity-20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      value={criteria[co]?.partial !== undefined ? criteria[co]?.partial : ''}
                      onChange={(e) => handleChange(co, 'partial', e.target.value)}
                      onFocus={() => setFocusedField(`${co}-partial`)}
                      onBlur={(e) => handleBlur(co, 'partial', e.target.value)}
                    />
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Note: Values will automatically be limited to a range of 0-100%.
      </div>
    </div>
  );
};

export default TargetAttainment;