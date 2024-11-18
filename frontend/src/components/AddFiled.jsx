import React, { useState, useEffect } from 'react';

const AddField = ({ label, onChange, initialData = [] }) => {
  const [fields, setFields] = useState(initialData);

  // Add a new empty field
  const addField = () => {
    const newFields = [...fields, ''];
    setFields(newFields);
    onChange(newFields);
  };

  // Remove a field at specific index
  const removeField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    onChange(newFields);
  };

  // Update field value at specific index
  const updateField = (index, value) => {
    const newFields = fields.map((field, i) => (i === index ? value : field));
    setFields(newFields);
    onChange(newFields);
  };

  // Effect to handle initialData changes
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setFields(initialData);
    }
  }, [initialData]);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{label}</h3>
        <button
          onClick={addField}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add {label}
        </button>
      </div>
      
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={field}
              onChange={(e) => updateField(index, e.target.value)}
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter ${label.toLowerCase()} here...`}
            />
            <button
              onClick={() => removeField(index)}
              className="px-2 py-1 text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddField;
