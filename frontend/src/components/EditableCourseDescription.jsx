import React, { useState, useEffect } from 'react';
import data from './data.json';

const EditableCourseDescription = ({courseDescription, onChange}) => {
  const [description, setDescription] = useState(courseDescription);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    onChange({ description });
  }, [description]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically update the data in your backend
    console.log('Saving new description:', description);
  };

  const handleChange = (e) => {
    setDescription(e.target.value);
  };

  return (
    <div className="mb-6 p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Description and its objectives</h3>
      {isEditing ? (
        <div>
          <textarea
            className="w-full p-2 border rounded-md min-h-[150px] text-sm"
            value={description}
            onChange={handleChange}
            rows={10}
          />
          <button
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-sm">{description}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleEdit}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableCourseDescription;