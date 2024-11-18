import AddField from './AddFiled';
import { useState } from 'react';
const ActionsForWeakStudents = () => {
 
  const [learningResources, setLearningResources] = useState({
    weakStudents: []
  });

  return (
    <div className="form-section">
      <div className="flex items-center mb-2">
        <div className="section-number bg-pink-400 text-white rounded-full w-16 h-8 flex items-center justify-center mr-2">
          14
        </div>
        <h2 className="section-title text-xl font-semibold">
          Actions Taken for Weak Students
        </h2>
      </div>
      <AddField
        label="The data for weak students"
        onChange={(updatedFields) => setLearningResources({ ...learningResources, weakStudents: updatedFields })}
        />
     
    </div>
  );
};

export default ActionsForWeakStudents;
