import React, { useState, useEffect } from 'react';

const COPOMapping = ({ onSave, initialData }) => {
  // Initialize state for CO descriptions
  const [courseOutcomes, setCourseOutcomes] = useState({
    CO1: { description: '', bullets: [] },
    CO2: { description: '', bullets: [] },
    CO3: { description: '', bullets: [] }
  });

  // Initialize mapping data with empty values
  const [mappingData, setMappingData] = useState({
    CO1: {
      PO1: '', PO2: '', PO3: '', PO4: '', PO5: '', PO6: '', 
      PO7: '', PO8: '', PO9: '', PO10: '', PO11: '', PO12: '',
      PSO1: '', PSO2: '', PSO3: '', PSO4: ''
    },
    CO2: {
      PO1: '', PO2: '', PO3: '', PO4: '', PO5: '', PO6: '', 
      PO7: '', PO8: '', PO9: '', PO10: '', PO11: '', PO12: '',
      PSO1: '', PSO2: '', PSO3: '', PSO4: ''
    },
    CO3: {
      PO1: '', PO2: '', PO3: '', PO4: '', PO5: '', PO6: '', 
      PO7: '', PO8: '', PO9: '', PO10: '', PO11: '', PO12: '',
      PSO1: '', PSO2: '', PSO3: '', PSO4: ''
    }
  });

  // Effect to initialize with any provided data
  useEffect(() => {
    if (initialData) {
      if (initialData.courseOutcomes) {
        setCourseOutcomes(initialData.courseOutcomes);
      }
      if (initialData.mappingData) {
        setMappingData(initialData.mappingData);
      }
    }
  }, [initialData]);

  const headers = [
    'CO/PO', 
    'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 
    'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12',
    'PSO1', 'PSO2', 'PSO3', 'PSO4'
  ];

  const handleCellChange = (co, po, value) => {
    if (value === '' || /^[1-3]$/.test(value)) {
      const newMappingData = {
        ...mappingData,
        [co]: {
          ...mappingData[co],
          [po]: value
        }
      };
      setMappingData(newMappingData);
      
      // Save the complete state
      if (onSave) {
        onSave({
          courseOutcomes,
          mappingData: newMappingData
        });
      }
    }
  };

  const handleOutcomeChange = (co, field, value) => {
    const newCourseOutcomes = {
      ...courseOutcomes,
      [co]: {
        ...courseOutcomes[co],
        [field]: value
      }
    };
    setCourseOutcomes(newCourseOutcomes);
    
    // Save the complete state
    if (onSave) {
      onSave({
        courseOutcomes: newCourseOutcomes,
        mappingData
      });
    }
  };

  const addBullet = (co) => {
    const newCourseOutcomes = {
      ...courseOutcomes,
      [co]: {
        ...courseOutcomes[co],
        bullets: [...courseOutcomes[co].bullets, '']
      }
    };
    setCourseOutcomes(newCourseOutcomes);
    
    // Save the complete state
    if (onSave) {
      onSave({
        courseOutcomes: newCourseOutcomes,
        mappingData
      });
    }
  };

  const handleBulletChange = (co, index, value) => {
    const newCourseOutcomes = {
      ...courseOutcomes,
      [co]: {
        ...courseOutcomes[co],
        bullets: courseOutcomes[co].bullets.map((bullet, i) => 
          i === index ? value : bullet
        )
      }
    };
    setCourseOutcomes(newCourseOutcomes);
    
    // Save the complete state
    if (onSave) {
      onSave({
        courseOutcomes: newCourseOutcomes,
        mappingData
      });
    }
  };

  const addRow = () => {
    const newCoNumber = Object.keys(mappingData).length + 1;
    const newCo = `CO${newCoNumber}`;
    
    // Create empty mapping for all POs and PSOs
    const newPoMap = headers.slice(1).reduce((acc, po) => {
      acc[po] = '';
      return acc;
    }, {});

    const newMappingData = {
      ...mappingData,
      [newCo]: newPoMap
    };

    const newCourseOutcomes = {
      ...courseOutcomes,
      [newCo]: { description: '', bullets: [] }
    };

    setMappingData(newMappingData);
    setCourseOutcomes(newCourseOutcomes);
    
    // Save the complete state
    if (onSave) {
      onSave({
        courseOutcomes: newCourseOutcomes,
        mappingData: newMappingData
      });
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Outcomes Mapping</h2>
        
        {/* Course Outcomes Section */}
        <div className="space-y-4">
          {Object.entries(courseOutcomes).map(([co, outcome]) => (
            <div key={co} className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <strong className="text-gray-700 min-w-[60px]">{co}:</strong>
                <input 
                  type="text" 
                  value={outcome.description} 
                  onChange={(e) => handleOutcomeChange(co, 'description', e.target.value)} 
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter course outcome description"
                />
              </div>
              {outcome.bullets.map((bullet, index) => (
                <div key={index} className="ml-8 mb-2 flex items-center gap-2">
                  <span>•</span>
                  <input 
                    type="text" 
                    value={bullet} 
                    onChange={(e) => handleBulletChange(co, index, e.target.value)} 
                    className="flex-1 p-2 border rounded" 
                    placeholder="Enter bullet point"
                  />
                </div>
              ))}
              <button 
                onClick={() => addBullet(co)}
                className="ml-8 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Bullet Point
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mapping Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header} className="border border-gray-300 bg-gray-100 p-3 text-sm font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(mappingData).map(([co, poMap]) => (
              <tr key={co}>
                <td className="border border-gray-300 font-semibold p-3 bg-gray-50">
                  {co}
                </td>
                {headers.slice(1).map(po => (
                  <td key={`${co}-${po}`} className="border border-gray-300 p-2">
                    <input
                      type="text"
                      value={poMap[po]}
                      onChange={(e) => handleCellChange(co, po, e.target.value)}
                      className="w-full text-center p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={1}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button 
        onClick={addRow} 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Add Course Outcome
      </button>
    </div>
  );
};

export default COPOMapping;