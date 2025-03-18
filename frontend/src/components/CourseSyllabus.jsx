import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus } from 'lucide-react';

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

    // Auto-resize textareas when content changes
    if (field === 'content') {
      adjustTextareaHeight();
    }
  };

  // Function to handle auto-resizing of textareas
  const adjustTextareaHeight = () => {
    const textareas = document.querySelectorAll('textarea.syllabus-content');
    textareas.forEach(textarea => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  };

  // Apply auto-resize effect after rendering
  useEffect(() => {
    adjustTextareaHeight();
  }, [syllabusData]);

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
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <div className="flex items-center gap-4 mb-6">
        <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              13
            </div>
        <h2 className="text-2xl font-semibold text-gray-800">
          Course content and session wise plan
        </h2>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
              <th className="border-b border-gray-200 p-4 text-sm font-semibold text-gray-700 text-left w-20">Sr. No.</th>
              <th className="border-b border-gray-200 p-4 text-sm font-semibold text-gray-700 text-left">Content</th>
              <th className="border-b border-gray-200 p-4 text-sm font-semibold text-gray-700 text-left w-32">CO</th>
              <th className="border-b border-gray-200 p-4 text-sm font-semibold text-gray-700 text-left w-40">Sessions</th>
              <th className="border-b border-gray-200 p-4 text-sm font-semibold text-gray-700 text-left w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {syllabusData.map((row, index) => (
              <tr key={index} className="hover:bg-amber-50 transition-colors">
                <td className="border-b border-gray-200 p-4 text-gray-700 font-medium">
                  {row.srNo}
                </td>
                <td className="border-b border-gray-200 p-4">
                  <textarea
                    value={row.content}
                    onChange={(e) => handleInputChange(index, 'content', e.target.value)}
                    className="syllabus-content w-full p-3 border border-gray-200 rounded-md bg-white hover:border-amber-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-colors outline-none min-h-[40px] resize-none overflow-hidden text-gray-700"
                    placeholder="Enter content..."
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                </td>
                <td className="border-b border-gray-200 p-4">
                  <div className="relative group">
                    <input
                      type="text"
                      value={row.co}
                      onChange={(e) => handleInputChange(index, 'co', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-md bg-white hover:border-amber-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-colors outline-none text-center text-gray-700"
                      placeholder="CO"
                      title="Enter in format CO1, CO2, etc."
                    />
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none z-10">
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
                      className="w-full p-3 border border-gray-200 rounded-md bg-white hover:border-amber-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-colors outline-none text-center text-gray-700"
                      placeholder="Sessions"
                      title="Write the number of sessions which are needed to cover this content"
                    />
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none z-10">
                      Number of sessions needed
                    </div>
                  </div>
                </td>
                <td className="border-b border-gray-200 p-4">
                  {syllabusData.length > 1 && (
                    <button 
                      onClick={() => removeRow(index)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-100"
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
        className="mt-6 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-md hover:from-amber-600 hover:to-orange-500 transition-colors shadow-sm flex items-center justify-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-amber-300"
      >
        <Plus size={18} />
        Add Row
      </button>
    </div>
  );
};

export default CourseSyllabus;