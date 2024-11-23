import { useState, useEffect } from 'react';

const WeeklyTimetable = ({ onChange, initialData }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '9:00-10:00', 
    '10:00-11:00', 
    '11:00-12:00', 
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00'
  ];

  // Create an empty timetable structure
  const createEmptyTimetable = () => {
    const timetable = {};
    days.forEach(day => {
      timetable[day] = {};
      timeSlots.forEach(slot => {
        timetable[day][slot] = false;
      });
    });
    return timetable;
  };

  // Initialize state with initialData or empty timetable
  const [timetable, setTimetable] = useState(() => {
    return initialData || createEmptyTimetable();
  });

  // Handle initialData changes
  useEffect(() => {
    if (initialData) {
      const mergedTimetable = createEmptyTimetable();
      days.forEach(day => {
        if (initialData[day]) {
          timeSlots.forEach(slot => {
            if (initialData[day][slot] !== undefined) {
              mergedTimetable[day][slot] = initialData[day][slot];
            }
          });
        }
      });
      setTimetable(mergedTimetable);
    }
  }, [initialData]);

  // Handle cell click
  const handleCellClick = (day, timeSlot) => {
    const newTimetable = {
      ...timetable,
      [day]: {
        ...timetable[day],
        [timeSlot]: !timetable[day][timeSlot]
      }
    };
    setTimetable(newTimetable);
    onChange?.(newTimetable);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="bg-gray-50 border border-gray-200 p-3 font-semibold text-gray-700 text-sm w-32">
              Time Slots
            </th>
            {days.map(day => (
              <th 
                key={day} 
                className="bg-gray-50 border border-gray-200 p-3 font-semibold text-gray-700 text-sm"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(timeSlot => (
            <tr key={timeSlot}>
              <td className="border border-gray-200 p-3 text-sm text-gray-600 font-medium bg-gray-50">
                {timeSlot}
              </td>
              {days.map(day => (
                <td 
                  key={`${day}-${timeSlot}`} 
                  onClick={() => handleCellClick(day, timeSlot)}
                  className={`border border-gray-200 p-3 text-center cursor-pointer transition-all duration-200
                    ${timetable[day]?.[timeSlot] 
                      ? 'bg-[#FFB255] bg-opacity-20 hover:bg-opacity-30' 
                      : 'hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center justify-center">
                    <div 
                      className={`w-5 h-5 rounded border transition-all duration-200
                        ${timetable[day]?.[timeSlot]
                          ? 'border-[#FFB255] bg-[#FFB255]'
                          : 'border-gray-300 bg-white'
                        }`}
                    >
                      {timetable[day]?.[timeSlot] && (
                        <svg 
                          className="w-full h-full text-white" 
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path 
                            d="M20 6L9 17l-5-5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyTimetable;