import React, { useState, useEffect } from 'react';

const MBAWeeklyTimetable = ({ onChange, initialData }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
  const durations = [1, 1.5, 2, 2.5, 3, 3.5, 4]; // Common class durations in hours
  
  // Initialize timetable entries state
  const [entries, setEntries] = useState([]);
  
  // Load initial data if provided
  useEffect(() => {
    if (initialData && initialData.entries) {
      setEntries(initialData.entries);
    }
  }, [initialData]);
  
  // Add a new empty entry
  const addEntry = () => {
    const newEntry = {
      id: Date.now(), // Unique identifier
      day: days[0],
      hour: 9,
      period: 'AM',
      duration: 1
    };
    
    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    onChange?.({ entries: updatedEntries });
  };
  
  // Remove an entry
  const removeEntry = (id) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    onChange?.({ entries: updatedEntries });
  };
  
  // Handle changes to an entry
  const handleEntryChange = (id, field, value) => {
    const updatedEntries = entries.map(entry => {
      if (entry.id === id) {
        return { ...entry, [field]: value };
      }
      return entry;
    });
    
    setEntries(updatedEntries);
    onChange?.({ entries: updatedEntries });
  };
  
  return (
    <div className="bg-white rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">MBA Weekly Schedule</h3>
        <button
          onClick={addEntry}
          className="bg-[#FFB255] hover:bg-[#f5a543] text-white px-4 py-2 rounded-md transition-colors"
        >
          Add Class
        </button>
      </div>
      
      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No classes scheduled. Click "Add Class" to create your timetable.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div 
              key={entry.id} 
              className="flex flex-wrap items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              {/* Day Selection */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={entry.day}
                  onChange={(e) => handleEntryChange(entry.id, 'day', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB255] focus:border-transparent"
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              
              {/* Hour Selection */}
              <div className="min-w-[100px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Hour</label>
                <select
                  value={entry.hour}
                  onChange={(e) => handleEntryChange(entry.id, 'hour', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB255] focus:border-transparent"
                >
                  {hours.map(hour => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
              </div>
              
              {/* AM/PM Selection */}
              <div className="min-w-[100px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">AM/PM</label>
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => handleEntryChange(entry.id, 'period', 'AM')}
                    className={`flex-1 px-3 py-2 text-sm font-medium ${
                      entry.period === 'AM'
                        ? 'bg-[#FFB255] text-white'
                        : 'bg-white text-gray-700 border-gray-300 border'
                    } rounded-l-md focus:outline-none transition-colors`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEntryChange(entry.id, 'period', 'PM')}
                    className={`flex-1 px-3 py-2 text-sm font-medium ${
                      entry.period === 'PM'
                        ? 'bg-[#FFB255] text-white'
                        : 'bg-white text-gray-700 border-gray-300 border'
                    } rounded-r-md focus:outline-none transition-colors`}
                  >
                    PM
                  </button>
                </div>
              </div>
              
              {/* Duration Selection */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                <select
                  value={entry.duration}
                  onChange={(e) => handleEntryChange(entry.id, 'duration', parseFloat(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB255] focus:border-transparent"
                >
                  {durations.map(duration => (
                    <option key={duration} value={duration}>{duration}</option>
                  ))}
                </select>
              </div>
              
              {/* Time Summary */}
              <div className="flex-grow min-w-[180px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Time</label>
                <div className="p-2 bg-white border border-gray-300 rounded-md text-gray-800">
                  {entry.hour}:00 {entry.period} - {getEndTime(entry.hour, entry.period, entry.duration)}
                </div>
              </div>
              
              {/* Remove Button */}
              <div className="ml-auto">
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Weekly View Display */}
      {entries.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Weekly Overview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  {days.map(day => (
                    <th key={day} className="py-3 px-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {days.map(day => (
                    <td key={day} className="py-3 px-4 border-b border-gray-200 text-sm">
                      <div className="space-y-2">
                        {entries
                          .filter(entry => entry.day === day)
                          .sort((a, b) => {
                            if (a.period === b.period) {
                              return a.hour - b.hour;
                            }
                            return a.period === 'AM' ? -1 : 1;
                          })
                          .map(entry => (
                            <div key={entry.id} className="p-2 bg-[#FFB255] bg-opacity-20 rounded border-l-4 border-[#FFB255] text-xs">
                              <div className="font-medium">{entry.hour}:00 {entry.period} - {getEndTime(entry.hour, entry.period, entry.duration)}</div>
                              <div>Duration: {entry.duration} hr{entry.duration !== 1 ? 's' : ''}</div>
                            </div>
                          ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate end time
function getEndTime(startHour, period, duration) {
  let hour = startHour;
  let endPeriod = period;
  
  const hourPart = Math.floor(duration);
  const minutePart = (duration - hourPart) * 60;
  
  hour += hourPart;
  let minutes = minutePart;
  
  // Handle period change
  if (hour >= 12) {
    if (hour > 12) {
      hour = hour - 12;
    }
    if (period === 'AM') {
      endPeriod = 'PM';
    }
  }
  
  // Format the time
  return `${hour}:${minutes > 0 ? minutes : '00'} ${endPeriod}`;
}

export default MBAWeeklyTimetable;