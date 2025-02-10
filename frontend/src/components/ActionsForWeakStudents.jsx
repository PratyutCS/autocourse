import { useState, useEffect } from 'react';
import AddField from './AddFiled';


const ActionsForWeakStudents = ({ onSave, initialData }) => {
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
        <AddField
          label="Action Taken for Weak Students"
          initialData={actions}
          onChange={handleActionsChange}
        />
  );
};

export default ActionsForWeakStudents;
