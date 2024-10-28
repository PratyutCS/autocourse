import React, { useState } from 'react';

const ProgramOutcomesEditor = ({ onChange }) => {
  const [outcomes, setOutcomes] = useState({
    peo: {
      "PEO 1": "",
      "PEO 2": "",
      "PEO 3": "",
      "PEO 4": ""
    },
    po: {
      "PO1": "",
      "PO2": "",
      "PO3": "",
      "PO4": "",
      "PO5": "",
      "PO6": "",
      "PO7": "",
      "PO8": "",
      "PO9": "",
      "PO10": "",
      "PO11": "",
      "PO12": ""
    },
    pso: {
      "PSO1": "",
      "PSO2": "",
      "PSO3": "",
      "PSO4": ""
    }
  });

  const handleChange = (section, key, value) => {
    const newOutcomes = {
      ...outcomes,
      [section]: {
        ...outcomes[section],
        [key]: value
      }
    };
    setOutcomes(newOutcomes);
    // Call onChange directly after state update
    if (onChange) {
      onChange(newOutcomes);
    }
  };

  const renderSection = (title, sectionKey) => {
    const sectionData = outcomes[sectionKey];
    const displayTitle = {
      peo: "Program Educational Objectives (PEO)",
      po: "Program Outcomes (PO)",
      pso: "Program Specific Outcomes (PSO)"
    }[sectionKey];

    return (
      <div key={sectionKey} className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{displayTitle}</h2>
        </div>
        <div className="space-y-4">
          {Object.keys(sectionData).map((key) => (
            <div key={key} className="flex flex-col space-y-2">
              <label className="font-medium text-gray-700">{key}:</label>
              <textarea
                value={sectionData[key]}
                onChange={(e) => handleChange(sectionKey, key, e.target.value)}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-black-500 focus:black-500 min-h-[5vh] text-sm"
                placeholder={`Enter ${key} description...`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSection("Program Educational Objectives (PEO)", "peo")}
      {renderSection("Program Outcomes (PO)", "po")}
      {renderSection("Program Specific Outcomes (PSO)", "pso")}
    </div>
  );
};

export default ProgramOutcomesEditor;