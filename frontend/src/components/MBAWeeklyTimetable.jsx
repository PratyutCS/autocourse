import React, { useState, useEffect } from 'react';

const MBAWeeklyTimetable = ({ onChange, initialData }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
  const durations = [1, 1.5, 2, 2.5, 3, 3.5, 4]; // Common class durations in hours

  // Initialize timetable entries state
  const [entries, setEntries] = useState([]);

  // Popup state
  const [popup, setPopup] = useState({
    show: false,
    message: ''
  });

  // Load initial data if provided
  useEffect(() => {
    if (initialData && initialData.entries) {
      setEntries(initialData.entries);
    }
  }, [initialData]);

  // Helper: Convert an entry's time to minutes since midnight (using 24-hour format)
  const getTimeRange = (entry) => {
    let hour24;
    // Convert 12 to 0 for AM, and leave 12 as 12 for PM.
    if (entry.hour === 12) {
      hour24 = entry.period === 'AM' ? 0 : 12;
    } else {
      hour24 = entry.period === 'AM' ? entry.hour : entry.hour + 12;
    }
    const start = hour24 * 60;
    const end = start + entry.duration * 60;
    return { start, end };
  };

  // Helper: Check if newEntry conflicts with any entry in the list (optionally ignoring one by id)
  const hasConflict = (newEntry, entryList, ignoreId) => {
    const { start: newStart, end: newEnd } = getTimeRange(newEntry);
    return entryList.some(entry => {
      if (ignoreId && entry.id === ignoreId) return false;
      if (entry.day !== newEntry.day) return false;
      const { start, end } = getTimeRange(entry);
      // Check for overlap: intervals [newStart,newEnd) and [start,end)
      return newStart < end && newEnd > start;
    });
  };

  // Show popup message
  const showPopup = (message) => {
    setPopup({
      show: true,
      message
    });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setPopup({
        show: false,
        message: ''
      });
    }, 3000);
  };

  // Add a new entry, but if the default timeslot is occupied then find an alternative
  const addEntry = () => {
    let newEntry = {
      id: Date.now(),
      day: days[0],
      hour: 9,
      period: 'AM',
      duration: 1
    };

    // If the default timeslot conflicts, iterate through days, hours, and periods to find an open slot.
    if (hasConflict(newEntry, entries)) {
      let found = false;
      // Loop through days, then hours and periods
      for (let d = 0; d < days.length && !found; d++) {
        for (let h = 1; h <= 12 && !found; h++) {
          for (let p of ['AM', 'PM']) {
            const candidate = { ...newEntry, day: days[d], hour: h, period: p };
            if (!hasConflict(candidate, entries)) {
              newEntry = candidate;
              found = true;
              break;
            }
          }
        }
      }
      if (!found) {
        showPopup("No available time slot found for the new class.");
        return;
      }
    }

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    onChange?.({ entries: updatedEntries });
  };

  // Handle changes to an entry with conflict checking
  const handleEntryChange = (id, field, value) => {
    // Create candidate update for the target entry
    const candidateEntries = entries.map(entry => {
      if (entry.id === id) {
        return { ...entry, [field]: value };
      }
      return entry;
    });
    const updatedEntry = candidateEntries.find(entry => entry.id === id);

    // Check conflict with other entries on the same day
    if (hasConflict(updatedEntry, candidateEntries, id)) {
      showPopup("Time slot conflicts with an existing class. Please choose a different time.");
      return;
    }

    setEntries(candidateEntries);
    onChange?.({ entries: candidateEntries });
  };

  // Helper: Calculate end time using 24-hour arithmetic then convert to 12-hour format.
  const getEndTime = (startHour, period, duration) => {
    let hour24;
    if (startHour === 12) {
      hour24 = period === 'AM' ? 0 : 12;
    } else {
      hour24 = period === 'AM' ? startHour : startHour + 12;
    }
    const startMinutes = hour24 * 60;
    const durationMinutes = Math.round(duration * 60);
    let endMinutes = (startMinutes + durationMinutes) % (24 * 60);
    const endHour24 = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    const endPeriod = endHour24 >= 12 ? 'PM' : 'AM';
    let endHour = endHour24 % 12;
    if (endHour === 0) endHour = 12;
    const minuteStr = endMinute.toString().padStart(2, '0');
    return `${endHour}:${minuteStr} ${endPeriod}`;
  };

  // Remove an entry
  const removeEntry = (id) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    onChange?.({ entries: updatedEntries });
  };

  return (
    <div className="bg-white rounded-lg relative">
      {/* Custom Popup Component */}
      {popup.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto animate-fade-in transform transition-all">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-[#FFB255]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-800">Schedule Conflict</h3>
                <div className="mt-2 text-sm text-gray-600">
                  {popup.message}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setPopup({ show: false, message: '' })}
                    className="bg-[#FFB255] hover:bg-[#f5a543] text-white px-4 py-2 rounded-md transition-colors text-sm"
                  >
                    Okay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          MBA Weekly Schedule - <span className="text-[#FFB255] font-bold">Add timetable for 1 week only</span>
        </h3>
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
                    className={`flex-1 px-3 py-2 text-sm font-medium ${entry.period === 'AM'
                      ? 'bg-[#FFB255] text-white'
                      : 'bg-white text-gray-700 border-gray-300 border'
                      } rounded-l-md focus:outline-none transition-colors`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEntryChange(entry.id, 'period', 'PM')}
                    className={`flex-1 px-3 py-2 text-sm font-medium ${entry.period === 'PM'
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
                <div className="p-2 bg-gray-200 border border-gray-300 rounded-md text-gray-500 select-none">
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
                            // Sort by converting time to minutes (AM/PM)
                            const getMinutes = (entry) => {
                              let hr = entry.hour;
                              if (entry.hour === 12) {
                                hr = entry.period === 'AM' ? 0 : 12;
                              } else {
                                hr = entry.period === 'AM' ? entry.hour : entry.hour + 12;
                              }
                              return hr * 60;
                            };
                            return getMinutes(a) - getMinutes(b);
                          })
                          .map(entry => (
                            <div key={entry.id} className="p-2 bg-[#FFB255] bg-opacity-20 rounded border-l-4 border-[#FFB255] text-xs">
                              <div className="font-medium">
                                {entry.hour}:00 {entry.period} - {getEndTime(entry.hour, entry.period, entry.duration)}
                              </div>
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

export default MBAWeeklyTimetable;
