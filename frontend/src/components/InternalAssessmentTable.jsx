import React, { useState, useEffect } from 'react';

const InternalAssessmentTable = ({ onSave, initialData }) => {
  const [assessmentData, setAssessmentData] = useState({
    components: initialData?.components || {
      component1: {
        component: '',
        duration: '',
        weightage: '',
        evaluation: '',
        week: '',
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
        evaluation: '',
        week: '',
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
      <div className="flex justify-end">
        <button
          onClick={addRow}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Row
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b">Component</th>
              <th className="px-4 py-2 border-b">Duration</th>
              <th className="px-4 py-2 border-b">Weightage (%)</th>
              <th className="px-4 py-2 border-b">Evaluation</th>
              <th className="px-4 py-2 border-b">Week</th>
              <th className="px-4 py-2 border-b">Remarks</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(assessmentData.components).map((componentKey) => (
              <tr key={componentKey}>
                <td className="px-4 py-2 border-b">
                  <input
                    type="text"
                    value={assessmentData.components[componentKey].component}
                    onChange={(e) => handleInputChange(componentKey, 'component', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <input
                    type="text"
                    value={assessmentData.components[componentKey].duration}
                    onChange={(e) => handleInputChange(componentKey, 'duration', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <input
                    type="text"
                    value={assessmentData.components[componentKey].weightage}
                    onChange={(e) => handleInputChange(componentKey, 'weightage', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <input
                    type="text"
                    value={assessmentData.components[componentKey].evaluation}
                    onChange={(e) => handleInputChange(componentKey, 'evaluation', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <input
                    type="text"
                    value={assessmentData.components[componentKey].week}
                    onChange={(e) => handleInputChange(componentKey, 'week', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <input
                    type="text"
                    value={assessmentData.components[componentKey].remarks}
                    onChange={(e) => handleInputChange(componentKey, 'remarks', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <button
                    onClick={() => removeRow(componentKey)}
                    className="text-red-500 hover:text-red-700 px-2 py-1"
                    disabled={Object.keys(assessmentData.components).length === 1}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InternalAssessmentTable;
