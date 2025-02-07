import React, { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";

const COPOMapping = ({ onSave, initialData }) => {
  // Initialize state for CO descriptions
  const [courseOutcomes, setCourseOutcomes] = useState({});
  // Initialize mapping data with empty values
  const [mappingData, setMappingData] = useState({});

  // Effect to initialize with any provided data
  useEffect(() => {
    if (initialData) {
      if (initialData.courseOutcomes) setCourseOutcomes(initialData.courseOutcomes);
      if (initialData.mappingData) setMappingData(initialData.mappingData);
    }
  }, [initialData]);

  const headers = [
    "CO/PO",
    "PO1", "PO2", "PO3", "PO4", "PO5", "PO6",
    "PO7", "PO8", "PO9", "PO10", "PO11", "PO12",
    "PSO1", "PSO2", "PSO3", "PSO4"
  ];

  const handleCellChange = (co, po, value) => {
    if (value === "" || /^[1-3]$/.test(value)) {
      const newMappingData = {
        ...mappingData,
        [co]: {
          ...mappingData[co],
          [po]: value,
        },
      };
      setMappingData(newMappingData);

      if (onSave) {
        onSave({
          courseOutcomes,
          mappingData: newMappingData,
        });
      }
    }
  };

  const handleOutcomeChange = (co, field, value) => {
    const newCourseOutcomes = {
      ...courseOutcomes,
      [co]: {
        ...courseOutcomes[co],
        [field]: value,
      },
    };
    setCourseOutcomes(newCourseOutcomes);

    if (onSave) {
      onSave({
        courseOutcomes: newCourseOutcomes,
        mappingData,
      });
    }
  };

  const addBullet = (co) => {
    const newCourseOutcomes = {
      ...courseOutcomes,
      [co]: {
        ...courseOutcomes[co],
        bullets: [...(courseOutcomes[co].bullets || []), ""],
      },
    };
    setCourseOutcomes(newCourseOutcomes);

    if (onSave) {
      onSave({
        courseOutcomes: newCourseOutcomes,
        mappingData,
      });
    }
  };

  const removeBullet = (co, index) => {
    const newCourseOutcomes = {
      ...courseOutcomes,
      [co]: {
        ...courseOutcomes[co],
        bullets: courseOutcomes[co].bullets.filter((_, i) => i !== index),
      },
    };
    setCourseOutcomes(newCourseOutcomes);

    if (onSave) {
      onSave({
        courseOutcomes: newCourseOutcomes,
        mappingData,
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
        ),
      },
    };
    setCourseOutcomes(newCourseOutcomes);

    if (onSave) {
      onSave({
        courseOutcomes: newCourseOutcomes,
        mappingData,
      });
    }
  };

  const addRow = () => {
    const newCoNumber = Object.keys(mappingData).length + 1;
    const newCo = `CO${newCoNumber}`;

    const newPoMap = headers.slice(1).reduce((acc, po) => {
      acc[po] = "";
      return acc;
    }, {});

    const newMappingData = {
      ...mappingData,
      [newCo]: newPoMap,
    };

    const newCourseOutcomes = {
      ...courseOutcomes,
      [newCo]: { description: "", bullets: [] },
    };

    setMappingData(newMappingData);
    setCourseOutcomes(newCourseOutcomes);

    if (onSave) {
      onSave({
        courseOutcomes: newCourseOutcomes,
        mappingData: newMappingData,
      });
    }
  };

  const removeCourseOutcome = (coToRemove) => {
    // Create new objects without the removed CO
    const remainingOutcomes = Object.fromEntries(
      Object.entries(courseOutcomes).filter(([key]) => key !== coToRemove)
    );

    const remainingMappings = Object.fromEntries(
      Object.entries(mappingData).filter(([key]) => key !== coToRemove)
    );

    // Renumber the remaining COs
    const renumberedOutcomes = {};
    const renumberedMappings = {};

    Object.entries(remainingOutcomes).forEach(([_, value], index) => {
      const newKey = `CO${index + 1}`;
      renumberedOutcomes[newKey] = value;
    });

    Object.entries(remainingMappings).forEach(([_, value], index) => {
      const newKey = `CO${index + 1}`;
      renumberedMappings[newKey] = value;
    });

    setCourseOutcomes(renumberedOutcomes);
    setMappingData(renumberedMappings);

    if (onSave) {
      onSave({
        courseOutcomes: renumberedOutcomes,
        mappingData: renumberedMappings,
      });
    }
  };

  return (
    <div className="w-full">
      {/* Course Outcomes Section */}
      <div className="space-y-4 mb-8">
        {Object.entries(courseOutcomes).map(([co, outcome]) => (
          <div
            key={co}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-gray-700 font-semibold min-w-[48px]">
                {co}:
              </span>
              <input
                type="text"
                value={outcome.description}
                onChange={(e) =>
                  handleOutcomeChange(co, "description", e.target.value)
                }
                className="flex-1 p-2.5 border border-gray-200 rounded bg-white hover:border-gray-300 transition-colors outline-none text-gray-700"
                placeholder="Enter course outcome description"
              />
              {Object.keys(courseOutcomes).length > 1 && (
                <button
                  onClick={() => removeCourseOutcome(co)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  title="Remove course outcome"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            {(outcome.bullets || []).map((bullet, index) => (
              <div key={index} className="ml-8 mb-2 flex items-center gap-2">
                <span className="text-gray-400">•</span>
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) =>
                    handleBulletChange(co, index, e.target.value)
                  }
                  className="flex-1 p-2 border border-gray-200 rounded bg-white hover:border-gray-300 transition-colors outline-none text-gray-700"
                  placeholder="Enter bullet point"
                />
                <button
                  onClick={() => removeBullet(co, index)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => addBullet(co)}
              className="ml-8 mt-2 flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 transition-colors"
            >
              <Plus size={16} />
              Add Bullet Point
            </button>
          </div>
        ))}
      </div>

      {/* Mapping Table Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            CO-PO Mapping Table
          </h3>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse" style={{ minWidth: "800px" }}>
            <thead>
              <tr className="bg-gray-50">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="border-b border-r border-gray-200 p-3 text-sm font-semibold text-gray-600 w-12 first:w-20"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(mappingData).map(([co, poMap]) => (
                <tr key={co} className="hover:bg-gray-50 transition-colors">
                  <td className="border-b border-r border-gray-200 font-semibold p-3 bg-gray-50 text-gray-700">
                    {co}
                  </td>
                  {headers.slice(1).map((po) => (
                    <td
                      key={`${co}-${po}`}
                      className="border-b border-r border-gray-200 p-2"
                    >
                      <input
                        type="text"
                        value={poMap[po] || ""}
                        onChange={(e) =>
                          handleCellChange(co, po, e.target.value)
                        }
                        className="w-full h-8 text-center outline-none bg-transparent hover:bg-white transition-colors text-gray-700"
                        maxLength={1}
                        placeholder="-"
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
          className="mt-4 px-4 py-2 bg-[#FFB255] hover:bg-[#f5a543] text-white rounded-lg transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          Add Course Outcome
        </button>
      </div>
    </div>
  );
};

export default COPOMapping;