import React, { useState, useEffect } from 'react';

const COAttainmentCriteria = ({ copoMappingData, initialCriteria, onSave }) => {
  const [criteria, setCriteria] = useState({});

  useEffect(() => {
    const initialData = initialCriteria || {};
    const newCriteria = {};

    // Preserve only the existing COs and set default values to 0 if they are empty or undefined.
    Object.keys(copoMappingData.courseOutcomes).forEach((co) => {
      newCriteria[co] = {
        full: initialData[co]?.full || 0,
        partial: initialData[co]?.partial || 0,
      };
    });

    if (JSON.stringify(criteria) !== JSON.stringify(newCriteria)) {
      setCriteria(newCriteria);
      onSave(newCriteria);
    }
  }, [copoMappingData, initialCriteria]);

  const handleChange = (co, type, value) => {
    // Convert empty values to 0, otherwise convert the string to a number.
    const numericValue = value === '' ? 0 : Number(value);
    const newCriteria = {
      ...criteria,
      [co]: {
        ...criteria[co],
        [type]: numericValue,
      },
    };
    setCriteria(newCriteria);
    onSave(newCriteria);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
          11
        </div>
        <h2 className="section-title text-xl font-semibold">
          CO Attainment Criteria
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Criteria</th>
              {Object.keys(copoMappingData.courseOutcomes).map((co) => (
                <th key={co} className="px-4 py-2 border-b">{co} (in %)</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border-b">Min. % marks (fully attained)</td>
              {Object.keys(copoMappingData.courseOutcomes).map((co) => (
                <td key={`${co}-full`} className="px-4 py-2 border-b">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-200 rounded-md"
                    value={criteria[co]?.full ?? 0}
                    onChange={(e) => handleChange(co, 'full', e.target.value)}
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-2 border-b">Min. % marks (partially attained)</td>
              {Object.keys(copoMappingData.courseOutcomes).map((co) => (
                <td key={`${co}-partial`} className="px-4 py-2 border-b">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-200 rounded-md"
                    value={criteria[co]?.partial ?? 0}
                    onChange={(e) => handleChange(co, 'partial', e.target.value)}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default COAttainmentCriteria;