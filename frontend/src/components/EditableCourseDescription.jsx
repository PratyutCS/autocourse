// import React from 'react';

import React, { useState, useEffect } from 'react';

const EditableCourseDescription = ({ courseDescription, onChange }) => {
  const [description, setDescription] = useState(courseDescription);

  useEffect(() => {
    setDescription(courseDescription);
  }, [courseDescription]);

  const handleChange = (e) => {
    setDescription(e.target.value);
    onChange({ description: e.target.value });
  };

  return (
    <div className="mb-6 p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Description and its objectives</h3>
      <textarea
        className="w-full p-2 border rounded-md min-h-[150px] text-sm"
        value={description}
        onChange={handleChange}
        rows={10}
        placeholder="Enter course description..."
      />
    </div>
  );
};

export default EditableCourseDescription;