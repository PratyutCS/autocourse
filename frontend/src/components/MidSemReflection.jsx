import React, { useState, useEffect } from 'react';
import AddField from './AddFiled';


const MidSemReflection = ({ onSave, initialData }) => {
  const [actions, setActions] = useState([]); 

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setActions(initialData);
    }
  }, [initialData]);

  const handleActionsChange = (updatedActions) => {
    setActions(updatedActions);
    if (onSave) {
      onSave(updatedActions);
    }
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
          15
        </div>
        <h2 className="text-xl font-semibold">
        Reflections from the Mid-term semester feedback.
        </h2>
      </div>
      <div className="mt-4">
        <AddField
          label="Reflections"
          initialData={actions}
          onChange={handleActionsChange}
        />
      </div>
    </div>
  );
};

export default MidSemReflection;
