import AddField from './AddFiled';
import { useState, useEffect } from 'react';
const ActionsForWeakStudents = ({ onSave, initialData }) => {
  const [learningResources, setLearningResources] = useState({
    weakStudents: initialData?.weakStudents || [],
  });

  // Save changes when learningResources is updated
  useEffect(() => {
    if (onSave) {
      onSave(learningResources);
    }
  }, [learningResources, onSave]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
        <div className="section-number bg-[#FFB255] text-white rounded-full w-16 h-8 flex items-center justify-center mr-2">
          14
        </div>
        <h2 className="section-title text-xl font-semibold">
          Actions Taken for Weak Students
        </h2>
      </div>
      <AddField
        label="The data for weak students"
        onChange={(updatedFields) =>
          setLearningResources({ weakStudents: updatedFields })
        }
      />
    </div>
  );
};

export default ActionsForWeakStudents;
