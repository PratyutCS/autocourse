import React, { useEffect, useRef } from 'react';

const EditableCourseDescription = ({ courseDescription, onChange }) => {
  const textareaRef = useRef(null);
  
  const handleChange = (e) => {
    onChange(e.target.value);
    adjustHeight();
  };
  
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to match the content
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  
  // Adjust height when component mounts or when courseDescription changes
  useEffect(() => {
    adjustHeight();
  }, [courseDescription]);
  
  return (
    <div className="">
      <textarea
        className="w-full p-2 border rounded-md min-h-[60px] text-sm overflow-hidden"
        value={courseDescription}
        onChange={handleChange}
        placeholder="Enter course description..."
        ref={textareaRef}
      />
    </div>
  );
};

export default EditableCourseDescription;