import React, { useState, useEffect, useRef } from 'react';

const COAttainmentCriteria = ({ copoMappingData, initialCriteria, onSave }) => {
  const [criteria, setCriteria] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const isInitialMount = useRef(true);
  
  // Clamp the value between 0 and 100
  const clampValue = (value) => {
    if (value === '') return '';
    let num = Number(value);
    if (isNaN(num)) return 0;
    if (num < 0) num = 0;
    if (num > 100) num = 100;
    return num;
  };
  
  // Only initialize criteria on first render or when courseOutcomes change
  useEffect(() => {
    // Initialize from props but don't trigger save
    const initialData = initialCriteria || {};
    const newCriteria = {};
    
    // Initialize only for existing COs and maintain empty string values
    Object.keys(copoMappingData.courseOutcomes).forEach((co) => {
      newCriteria[co] = {
        full: initialData[co]?.full !== undefined ? initialData[co]?.full : '',
        partial: initialData[co]?.partial !== undefined ? initialData[co]?.partial : '',
      };
    });
    
    // Just set the local state without calling onSave
    setCriteria(newCriteria);
  }, [copoMappingData.courseOutcomes]);
  
  // Sync with initialCriteria changes from the parent
  useEffect(() => {
    if (initialCriteria && Object.keys(initialCriteria).length > 0) {
      setCriteria(prevCriteria => {
        const newCriteria = { ...prevCriteria };
        
        Object.keys(initialCriteria).forEach(co => {
          if (newCriteria[co]) {
            newCriteria[co] = {
              full: initialCriteria[co].full !== undefined ? initialCriteria[co].full : newCriteria[co].full,
              partial: initialCriteria[co].partial !== undefined ? initialCriteria[co].partial : newCriteria[co].partial,
            };
          }
        });
        
        return newCriteria;
      });
    }
  }, [initialCriteria]);
  
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
    if (value !== '' && value !== numericValue.toString() && numericValue !== '') {
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
    
    // Convert empty strings to 0 only when saving
    const dataToSave = {};
    Object.keys(newCriteria).forEach((key) => {
      dataToSave[key] = {
        full: newCriteria[key].full === '' ? 0 : newCriteria[key].full,
        partial: newCriteria[key].partial === '' ? 0 : newCriteria[key].partial,
      };
    });
    
    // Only save if the data is different from the initial criteria
    if (JSON.stringify(dataToSave) !== JSON.stringify(initialCriteria)) {
      onSave(dataToSave);
    }
    
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
          C
        </div>
        <h2 className="section-title text-xl font-semibold">
          CO Attainment Criteria
        </h2>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        Set the minimum percentage marks required for full and partial attainment for each course outcome.
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
                Min. % marks (fully attained)
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
                Min. % marks (partially attained)
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

export default COAttainmentCriteria;