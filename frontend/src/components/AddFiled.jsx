import React, { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";

const AddField = ({ label, onChange, initialData = [] }) => {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setFields(
        initialData.map((item) => (typeof item === "string" ? item : String(item)))
      );
    }
  }, [initialData]);

  // Add a new empty field
  const addField = () => {
    const newFields = [...fields, ""];
    setFields(newFields);
    onChange(newFields);
  };

  // Remove a field at a specific index
  const removeField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    onChange(newFields);
  };

  // Update field value at a specific index
  const updateField = (index, value) => {
    const newFields = fields.map((field, i) => (i === index ? value : field));
    setFields(newFields);
    onChange(newFields);
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-lg font-normal">{label}</p>
        <button
          onClick={addField}
          className="mt-4 px-4 py-2 bg-[#FFB255] text-white rounded hover:bg-[#FFB255]/90 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Row
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => {
          const safeField = typeof field === "string" ? field : String(field); // Ensure the field is a string
          return (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={safeField}
                onChange={(e) => updateField(index, e.target.value)}
                className={`w-full p-2 border rounded bg-white transition-colors outline-none text-gray-700 ${
                  safeField.trim() === ""
                    ? "border-red-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                placeholder={`Enter ${label.toLowerCase()}...`}
              />
              <button
                onClick={() => removeField(index)}
                className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                title="Remove row"
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AddField;
