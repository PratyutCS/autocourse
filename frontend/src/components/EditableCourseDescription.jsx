const EditableCourseDescription = ({ courseDescription, onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.value );
  };

  return (
    <div className="">
      <textarea
        className="w-full p-2 border rounded-md min-h-[150px] text-sm"
        value={courseDescription}
        onChange={handleChange}
        rows={10}
        placeholder="Enter course description..."
      />
    </div>
  );
};

export default EditableCourseDescription;