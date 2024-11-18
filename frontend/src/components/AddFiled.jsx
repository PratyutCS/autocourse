import { useState } from 'react';


const AddField = ({ label, onChange }) => {
  const [fields, setFields] = useState([""]);

  const handleAdd = () => {
    setFields([...fields, ""]);
  };

  const handleRemove = (index) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    if (onChange) onChange(updatedFields);
  };

  const handleChange = (value, index) => {
    const updatedFields = fields.map((field, i) => (i === index ? value : field));
    setFields(updatedFields);
    if (onChange) onChange(updatedFields);
  };

  return (
    <div className="add-field">
      <h3 className="text-lg font-semibold">{label}</h3>
      {fields.map((field, index) => (
        <div key={index} className="flex items-center gap-2 mb-2">
          <input
            type="text"
            className="p-2 border border-gray-300 rounded w-full"
            value={field}
            onChange={(e) => handleChange(e.target.value, index)}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="text-red-500"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="btn bg-pink-400 text-white px-4 py-2 rounded"
      >
        Add {label}
      </button>
    </div>
  );
};

export default AddField;
