import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';


const InternalAssessmentTable = ({ onSave, initialData }) => {
  const [assessmentData, setAssessmentData] = useState({
    components: initialData?.components || {
      component1: {
        component: '',
        duration: '',
        weightage: '',
        evaluationWeek: '',
        remarks: ''
      }
    }
  });

  useEffect(() => {
    if (initialData) {
      setAssessmentData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (componentKey, field, value) => {
    const newComponents = {
      ...assessmentData.components,
      [componentKey]: {
        ...assessmentData.components[componentKey],
        [field]: value
      }
    };
    const newData = {
      ...assessmentData,
      components: newComponents
    };

    setAssessmentData(newData);
    if (onSave) {
      onSave(newData);
    }
  };
  const addRow = () => {
    const newKey = `component${Date.now()}`;
    const newComponents = {
      ...assessmentData.components,
      [newKey]: {
        component: '',
        duration: '',
        weightage: '',
        evaluationWeek: '',
        remarks: ''
      }
    };

    const newData = {
      ...assessmentData,
      components: newComponents
    };
    setAssessmentData(newData);
    if (onSave) {
      onSave(newData);
    }
  };

  const removeRow = (componentKey) => {
    if (Object.keys(assessmentData.components).length > 1) {
      const { [componentKey]: _, ...newComponents } = assessmentData.components;
      const newData = {
        ...assessmentData,
        components: newComponents
      };
      setAssessmentData(newData);
      if (onSave) {
        onSave(newData);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* <div className="flex justify-end">
        
      </div> */}

<div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
          <thead>
            <tr className="bg-gray-50">
              <th className="border-b border-r border-gray-200 p-3 text-sm font-semibold text-gray-600 text-left">Component</th>
              <th className="border-b border-r border-gray-200 p-3 text-sm font-semibold text-gray-600 text-left w-32">Duration</th>
              <th className="border-b border-r border-gray-200 p-3 text-sm font-semibold text-gray-600 text-left w-32">Weightage (%)</th>
              <th className="border-b border-r border-gray-200 p-3 text-sm font-semibold text-gray-600 text-left w-40">Evaluation Week</th>
              <th className="border-b border-r border-gray-200 p-3 text-sm font-semibold text-gray-600 text-left">Remarks</th>
              <th className="border-b border-gray-200 p-3 text-sm font-semibold text-gray-600 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(assessmentData.components).map((componentKey) => (
              <tr key={componentKey} className="hover:bg-gray-50 transition-colors">
                <td className="border-b border-r border-gray-200 p-3">
                  <input
                    type="text"
                    value={assessmentData.components[componentKey].component}
                    onChange={(e) => handleInputChange(componentKey, 'component', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded bg-white hover:border-gray-300 transition-colors outline-none text-gray-700"
                    placeholder="Enter component"
                  />
                </td>
                <td className="border-b border-r border-gray-200 p-3">
                  <input
                    type="text"
                    value={assessmentData.components[componentKey].duration}
                    onChange={(e) => handleInputChange(componentKey, 'duration', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded bg-white hover:border-gray-300 transition-colors outline-none text-gray-700"
                    placeholder="e.g. 2 hrs"
                  />
                </td>
                <td className="border-b border-r border-gray-200 p-3">
                  <input
                    type="text"
                    value={assessmentData.components[componentKey].weightage}
                    onChange={(e) => handleInputChange(componentKey, 'weightage', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded bg-white hover:border-gray-300 transition-colors outline-none text-gray-700"
                    placeholder="e.g. 20"
                  />
                </td>
                <td className="border-b border-r border-gray-200 p-3">
                  <input
                    type="text"
                    value={assessmentData.components[componentKey].evaluationWeek}
                    onChange={(e) => handleInputChange(componentKey, 'evaluation', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded bg-white hover:border-gray-300 transition-colors outline-none text-gray-700"
                    placeholder="Enter evaluation method"
                  />
                </td>
                <td className="border-b border-r border-gray-200 p-3">
                  <input
                    type="text"
                    value={assessmentData.components[componentKey].remarks}
                    onChange={(e) => handleInputChange(componentKey, 'remarks', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded bg-white hover:border-gray-300 transition-colors outline-none text-gray-700"
                    placeholder="Add remarks"
                  />
                </td>
                <td className="border-b border-gray-200 p-3 text-center">
                  {Object.keys(assessmentData.components).length > 1 && (
                    <button
                      onClick={() => removeRow(componentKey)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                      title="Remove row"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button 
        onClick={addRow}
        className="mt-6 px-6 py-2.5 bg-[#FFB255] hover:bg-[#f5a543] text-white rounded-lg transition-colors font-medium shadow-sm flex items-center gap-2"
      >
        <Plus size={18} />
        Add Component
      </button>
    </div>
  );
};

export default InternalAssessmentTable;
