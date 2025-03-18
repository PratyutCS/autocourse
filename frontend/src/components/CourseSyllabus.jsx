import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

const CourseSyllabus = ({ onSave, initialData }) => {
  // Initialize with default row if no initial data
  const [syllabusData, setSyllabusData] = useState(() => {
    return initialData?.length > 0 ? initialData : [{
      srNo: 1,
      content: '',
      co: '',
      sessions: ''
    }];
  });

  // Update local state when initialData changes from parent
  useEffect(() => {
    if (initialData?.length > 0) {
      setSyllabusData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (index, field, value) => {
    const newSyllabusData = syllabusData.map((item, i) => {
      if (i === index) {
        // For sessions, ensure it's a valid number or empty string
        if (field === 'sessions') {
          const numValue = value === '' ? '' : parseInt(value, 10);
          return { ...item, [field]: numValue >= 0 ? numValue : item[field] };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    
    setSyllabusData(newSyllabusData);
    
    // Immediate save to parent
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
    
    // Immediate save to parent
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
      
      // Immediate save to parent
      if (onSave) {
        onSave(newSyllabusData);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-4 mb-6">
        <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
        13
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">
          Course content and session wise plan
        </h2>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-gray-50">
              <th className="border-b border-gray-200 p-4 text-sm font-semibold text-gray-600 text-left w-20">Sr. No.</th>
              <th className="border-b border-gray-200 p-4 text-sm font-semibold text-gray-600 text-left">Content</th>
              <th className="border-b border-gray-200 p-4 text-sm font-semibold text-gray-600 text-left w-32">CO</th>
              <th className="border-b border-gray-200 p-4 text-sm font-semibold text-gray-600 text-left w-40">Sessions</th>
              <th className="border-b border-gray-200 p-4 text-sm font-semibold text-gray-600 text-left w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {syllabusData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="border-b border-gray-200 p-4 text-gray-600">
                  {row.srNo}
                </td>
                <td className="border-b border-gray-200 p-4">
                  <textarea
                    value={row.content}
                    onChange={(e) => handleInputChange(index, 'content', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded bg-white hover:border-gray-300 transition-colors outline-none min-h-[40px] resize-y text-gray-700"
                    placeholder="Enter content..."
                  />
                </td>
                <td className="border-b border-gray-200 p-4">
                  <div className="relative group">
                    <input
                      type="text"
                      value={row.co}
                      onChange={(e) => handleInputChange(index, 'co', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded bg-white hover:border-gray-300 transition-colors outline-none text-center text-gray-700"
                      placeholder="CO"
                      title="Enter in format CO1, CO2, etc."
                    />
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none">
                      Enter in format CO1, CO2, etc.
                    </div>
                  </div>
                </td>
                <td className="border-b border-gray-200 p-4">
                  <div className="relative group">
                    <input
                      type="number"
                      value={row.sessions}
                      onChange={(e) => handleInputChange(index, 'sessions', e.target.value)}
                      min="0"
                      className="w-full p-2 border border-gray-200 rounded bg-white hover:border-gray-300 transition-colors outline-none text-center text-gray-700"
                      placeholder="Sessions"
                      title="Write the number of sessions which are needed to cover this content"
                    />
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none">
                      Write the number of sessions which are needed to cover this content
                    </div>
                  </div>
                </td>
                <td className="border-b border-gray-200 p-4">
                  {syllabusData.length > 1 && (
                    <button 
                      onClick={() => removeRow(index)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                      title="Remove row"
                    >
                      <Trash2 size={18} />
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
        className="mt-4 px-4 py-2 bg-[#FFB255] text-white rounded hover:bg-[#FFB255]/90 transition-colors"
      >
        Add Row
      </button>
    </div>
  );
};

export default CourseSyllabus;