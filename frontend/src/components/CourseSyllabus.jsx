import React, { useState, useEffect } from 'react';

const CourseSyllabus = ({ onSave, initialData }) => {
  const [syllabusData, setSyllabusData] = useState([
    {
      srNo: 1,
      content: '',
      co: '',
      sessions: ''
    }
  ]);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setSyllabusData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (index, field, value) => {
    const newSyllabusData = syllabusData.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    
    setSyllabusData(newSyllabusData);
    if (onSave) {
      onSave(newSyllabusData);
    }
  };

  const addRow = () => {
    const newRow = {
      srNo: syllabusData.length + 1,
      content: '',
      co: '',
      sessions: ''
    };
    
    const newSyllabusData = [...syllabusData, newRow];
    setSyllabusData(newSyllabusData);
    
    if (onSave) {
      onSave(newSyllabusData);
    }
  };

  const removeRow = (index) => {
    if (syllabusData.length > 1) {
      const newSyllabusData = syllabusData
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          srNo: i + 1
        }));
      
      setSyllabusData(newSyllabusData);
      
      if (onSave) {
        onSave(newSyllabusData);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
        <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
          7
        </div>
        <h2 className="section-title text-xl font-semibold">
          Course Syllabus
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-100 p-3 text-sm font-semibold">Sr. No.</th>
              <th className="border border-gray-300 bg-gray-100 p-3 text-sm font-semibold">Content</th>
              <th className="border border-gray-300 bg-gray-100 p-3 text-sm font-semibold">CO</th>
              <th className="border border-gray-300 bg-gray-100 p-3 text-sm font-semibold">Number of Sessions</th>
              <th className="border border-gray-300 bg-gray-100 p-3 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {syllabusData.map((row, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2 text-center">
                  {row.srNo}
                </td>
                <td className="border border-gray-300 p-2">
                  <textarea
                    value={row.content}
                    onChange={(e) => handleInputChange(index, 'content', e.target.value)}
                    className="w-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-y"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="text"
                    value={row.co}
                    onChange={(e) => handleInputChange(index, 'co', e.target.value)}
                    className="w-full p-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    value={row.sessions}
                    onChange={(e) => handleInputChange(index, 'sessions', e.target.value)}
                    className="w-full p-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {syllabusData.length > 1 && (
                    <button 
                      onClick={() => removeRow(index)}
                      className="text-red-600 hover:text-red-800 px-2"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button 
        onClick={addRow}
        className="px-4 py-2 bg-[#FFB255] text-white rounded hover:bg-[#FFB255] transition-colors"
      >
        Add Row
      </button>
    </div>
  );
};

export default CourseSyllabus;
