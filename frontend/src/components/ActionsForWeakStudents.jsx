import React, { useState, useEffect } from 'react';

const ActionsForWeakStudents = ({ onSave, initialData }) => {
  const [actions, setActions] = useState(initialData || [
    { id: Date.now(), text: '' }
  ]);

  // Update actions if initialData prop changes
  useEffect(() => {
    if (initialData) {
      setActions(initialData);
    }
  }, [initialData]);

  const addNewAction = () => {
    const newId = Date.now();
    setActions([...actions, { id: newId, text: '' }]);
  };

  const updateAction = (id, newText) => {
    setActions(actions.map(action =>
      action.id === id ? { ...action, text: newText } : action
    ));
  };

  const removeAction = (id) => {
    if (actions.length > 1) {
      setActions(actions.filter(action => action.id !== id));
    }
  };

  useEffect(() => {
    // console.log("Actions have been updated:", actions);
    if (onSave) {
      onSave(actions);
    }
  }, [actions, onSave]);

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

      <div className="space-y-3">
        {actions.map((action, index) => (
          <div key={action.id} className="flex items-start space-x-2">
            <div className="flex-none pt-2">
              {index + 1}.
            </div>
            <div className="flex-grow">
              <textarea
                className="w-full p-2 border border-gray-300 rounded resize-none min-h-[60px]"
                placeholder="Enter action taken to support weak students..."
                value={action.text}
                onChange={(e) => updateAction(action.id, e.target.value)}
              />
            </div>
            <button
              onClick={() => removeAction(action.id)}
              className="flex-none mt-2 text-red-500 hover:text-red-700"
              disabled={actions.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addNewAction}
        className="mt-3 flex items-center text-blue-500 hover:text-blue-700"
      >
        <span className="mr-1 text-xl">+</span> Add Another Action
      </button>
    </div>
  );
};

export default ActionsForWeakStudents;
