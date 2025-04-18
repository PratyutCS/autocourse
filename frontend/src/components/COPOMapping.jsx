import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, X } from "lucide-react";

const COPOMapping = ({ onSave, initialData, program }) => {
  // Generate headers based on the program - using useMemo to avoid recalculations
  const headers = useMemo(() => {
    const programInt = parseInt(program);
    switch (programInt) {
      case 1: // Computer Science Engineering
        return [
          "CO/PO",
          "PO1", "PO2", "PO3", "PO4", "PO5", "PO6",
          "PO7", "PO8", "PO9", "PO10", "PO11", "PO12",
          "PSO1", "PSO2", "PSO3", "PSO4"
        ];
      case 2: // Mechanical Engineering
        return [
          "CO/PO",
          "PO1", "PO2", "PO3", "PO4", "PO5", "PO6",
          "PO7", "PO8", "PO9", "PO10", "PO11", "PO12",
          "PSO1", "PSO2"
        ];
      case 3: // Electronics and Computer Engineering
        return [
          "CO/PO",
          "PO1", "PO2", "PO3", "PO4", "PO5", "PO6",
          "PO7", "PO8", "PO9", "PO10", "PO11", "PO12", 
          "PSO1", "PSO2"
        ];
      case 4: // BBA
        return [
          "CO/PO",
          "PO1", "PO2", "PO3", "PO4", "PO5", "PO6",
          "PSFA1", "PSFA2"
        ];
      case 5: // BCOM(Hons)
        return [
          "CO/PO",
          "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8"
        ];
      case 6: // Integrated BBA/MBA
        return [
          "CO/PO",
          "PO1", "PO2", "PO3", "PO4", "PO5", "PO6",
          "PSFB1", "PSFB2", "PSFB3"
        ];
      case 7: // BA (Hons) Libreral Arts
        return [
          "CO/PO",
          "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7"
        ];
      case 8: // BA LLB (Hons)
        return [
          "CO/PO",
          "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7",
          "PSO1", "PSO2"
        ];
      case 9: // BBA LLB (Hons)
        return [
          "CO/PO",
          "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7",
          "PSO1", "PSO2"
        ];
      case 10: // MBA
        return [
          "CO/PO",
          "PO1", "PO2", "PO3", "PO4", "PO5", "PO6"
        ];
      default: // Default to Computer Science Engineering format
        return [
          "CO/PO",
          "PO1", "PO2", "PO3", "PO4", "PO5", "PO6",
          "PO7", "PO8", "PO9", "PO10", "PO11", "PO12",
          "PSO1", "PSO2", "PSO3", "PSO4"
        ];
    }
  }, [program]);

  // Initialize state based on initial data and current headers
  const [state, setState] = useState(() => {
    const courseOutcomes = initialData?.courseOutcomes || {};
    let mappingData = {};

    if (initialData?.mappingData) {
      Object.entries(initialData.mappingData).forEach(([co, poMap]) => {
        mappingData[co] = {};
        headers.slice(1).forEach(po => {
          mappingData[co][po] = poMap[po] || "";
        });
      });
    }

    return { courseOutcomes, mappingData };
  });

  // Update mapping data when program/headers change
  useEffect(() => {
    if (Object.keys(state.mappingData).length > 0) {
      const updatedMappingData = {};
      Object.entries(state.mappingData).forEach(([co, poMap]) => {
        updatedMappingData[co] = {};
        headers.slice(1).forEach(po => {
          updatedMappingData[co][po] = poMap[po] || "";
        });
      });
      // Only update and trigger onSave if the new mapping data differs
      if (JSON.stringify(state.mappingData) !== JSON.stringify(updatedMappingData)) {
        setState(prevState => ({
          ...prevState,
          mappingData: updatedMappingData
        }));
        onSave({
          courseOutcomes: state.courseOutcomes,
          mappingData: updatedMappingData,
        });
      }
    }
  }, [headers]);

  // Initialize state with initialData only if there is an actual difference
  useEffect(() => {
    if (initialData) {
      setState(prevState => {
        if (
          JSON.stringify(prevState.courseOutcomes) !== JSON.stringify(initialData.courseOutcomes) ||
          JSON.stringify(Object.keys(prevState.mappingData)) !== JSON.stringify(Object.keys(initialData.mappingData))
        ) {
          const newMappingData = {};
          Object.entries(initialData.mappingData || {}).forEach(([co, poMap]) => {
            newMappingData[co] = {};
            headers.slice(1).forEach(po => {
              newMappingData[co][po] = poMap[po] || "";
            });
          });

          const newState = {
            courseOutcomes: initialData.courseOutcomes || {},
            mappingData: newMappingData
          };

          if (JSON.stringify(prevState.mappingData) !== JSON.stringify(newMappingData)) {
            onSave(newState);
          }
          return newState;
        }
        return prevState;
      });
    }
  }, [initialData, headers]);

  // Handler for cell changes in the mapping table
  const handleCellChange = (co, po, value) => {
    if (value === "" || /^[1-3]$/.test(value)) {
      setState(prevState => {
        const newState = {
          ...prevState,
          mappingData: {
            ...prevState.mappingData,
            [co]: {
              ...prevState.mappingData[co],
              [po]: value,
            },
          }
        };
        onSave({
          courseOutcomes: prevState.courseOutcomes,
          mappingData: newState.mappingData,
        });
        return newState;
      });
    }
  };

  // Handler for course outcome description changes
  const handleOutcomeChange = (co, field, value) => {
    setState(prevState => {
      const newState = {
        ...prevState,
        courseOutcomes: {
          ...prevState.courseOutcomes,
          [co]: {
            ...prevState.courseOutcomes[co],
            [field]: value,
          },
        }
      };
      onSave({
        courseOutcomes: newState.courseOutcomes,
        mappingData: prevState.mappingData,
      });
      return newState;
    });
  };

  // Add a bullet point to a course outcome
  const addBullet = (co) => {
    setState(prevState => {
      const newState = {
        ...prevState,
        courseOutcomes: {
          ...prevState.courseOutcomes,
          [co]: {
            ...prevState.courseOutcomes[co],
            bullets: [...(prevState.courseOutcomes[co]?.bullets || []), ""],
          },
        }
      };
      onSave({
        courseOutcomes: newState.courseOutcomes,
        mappingData: prevState.mappingData,
      });
      return newState;
    });
  };

  // Remove a bullet point from a course outcome
  const removeBullet = (co, index) => {
    setState(prevState => {
      const newState = {
        ...prevState,
        courseOutcomes: {
          ...prevState.courseOutcomes,
          [co]: {
            ...prevState.courseOutcomes[co],
            bullets: prevState.courseOutcomes[co].bullets.filter((_, i) => i !== index),
          },
        }
      };
      onSave({
        courseOutcomes: newState.courseOutcomes,
        mappingData: prevState.mappingData,
      });
      return newState;
    });
  };

  // Handle bullet point text changes
  const handleBulletChange = (co, index, value) => {
    setState(prevState => {
      const newState = {
        ...prevState,
        courseOutcomes: {
          ...prevState.courseOutcomes,
          [co]: {
            ...prevState.courseOutcomes[co],
            bullets: prevState.courseOutcomes[co].bullets.map((bullet, i) =>
              i === index ? value : bullet
            ),
          },
        }
      };
      onSave({
        courseOutcomes: newState.courseOutcomes,
        mappingData: prevState.mappingData,
      });
      return newState;
    });
  };

  // Add a new course outcome
  const addRow = () => {
    setState(prevState => {
      const newCoNumber = Object.keys(prevState.mappingData).length + 1;
      const newCo = `CO${newCoNumber}`;
      const newPoMap = headers.slice(1).reduce((acc, po) => {
        acc[po] = "";
        return acc;
      }, {});

      const newState = {
        courseOutcomes: {
          ...prevState.courseOutcomes,
          [newCo]: { description: "", bullets: [] },
        },
        mappingData: {
          ...prevState.mappingData,
          [newCo]: newPoMap,
        }
      };

      onSave(newState);
      return newState;
    });
  };

  // Remove a course outcome and renumber remaining ones
  const removeCourseOutcome = (coToRemove) => {
    setState(prevState => {
      const remainingOutcomes = Object.fromEntries(
        Object.entries(prevState.courseOutcomes).filter(([key]) => key !== coToRemove)
      );
      const remainingMappings = Object.fromEntries(
        Object.entries(prevState.mappingData).filter(([key]) => key !== coToRemove)
      );

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

      const newState = {
        courseOutcomes: renumberedOutcomes,
        mappingData: renumberedMappings,
      };

      onSave(newState);
      return newState;
    });
  };

  // Display the program name based on its code
  const getProgramName = () => {
    const programInt = parseInt(program);
    switch (programInt) {
      case 1: return "Computer Science Engineering";
      case 2: return "Mechanical Engineering";
      case 3: return "Electronics and Computer Engineering";
      case 4: return "BBA";
      case 5: return "BCOM(Hons)";
      case 6: return "Integrated BBA/MBA";
      case 7: return "BA (Hons) Libreral Arts";
      case 8: return "BA LLB (Hons)";
      case 9: return "BBA LLB (Hons)";
      case 10: return "MBA";
      default: return "Default";
    }
  };

  return (
    <div className="w-full">
      {/* Course Outcomes Section */}
      <div className="space-y-4 mb-8">
        {Object.entries(state.courseOutcomes).map(([co, outcome]) => (
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
                value={outcome.description || ""}
                onChange={(e) =>
                  handleOutcomeChange(co, "description", e.target.value)
                }
                className="flex-1 p-2.5 border border-gray-200 rounded bg-white hover:border-gray-300 transition-colors outline-none text-gray-700"
                placeholder="Enter course outcome description"
              />
              {Object.keys(state.courseOutcomes).length > 1 && (
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
          <div className="text-sm text-gray-500 flex items-center bg-orange-50 px-3 py-1.5 rounded-md border border-orange-100">
            <span className="font-medium text-orange-600 mr-1">Current program:</span>
            <span className="text-gray-700">{getProgramName()}</span>
          </div>
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
              {Object.entries(state.mappingData).map(([co, poMap]) => (
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
                        onChange={(e) => handleCellChange(co, po, e.target.value)}
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
