import  { useState, useEffect } from 'react';

const COAttainmentCriteria = ({ copoMappingData, initialCriteria, onSave }) => {
  const [criteria, setCriteria] = useState({});

  useEffect(() => {
    const initialData = initialCriteria || {};
    const newCriteria = {};

    // Preserve only the existing COs
    Object.keys(copoMappingData.courseOutcomes).forEach((co) => {
      newCriteria[co] = {
        full: initialData[co]?.full || '',
        partial: initialData[co]?.partial || '',
      };
    });


    if (JSON.stringify(criteria) !== JSON.stringify(newCriteria)) {
      setCriteria(newCriteria);
      onSave(newCriteria);
    }

    
    console.log("criteria1 is :",criteria);
  }, [copoMappingData, initialCriteria]);
  
  useEffect(() => {
    console.log("criteria is :",criteria);
  }, [criteria]);

  const handleChange = (co, type, value) => {
    const newCriteria = {
      ...criteria,
      [co]: {
        ...criteria[co],
        [type]: value,
      },
    };
    setCriteria(newCriteria);
    onSave(newCriteria); // Automatically save changes
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
      
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
                    className="w-full p-2 border border-gray-200 rounded-md"
                    value={criteria[co]?.full || ''}
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
                    className="w-full p-2 border border-gray-200 rounded-md"
                    value={criteria[co]?.partial || ''}
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