import React, { useEffect } from 'react';

const AttendanceReport = ({ initialData, onChange }) => {
  // Define the columns we want to show
  const columnsToShow = ['Student Name', 'Unique Id.', 'Attendance'];

  useEffect(() => {
    console.log("initialData is :", initialData);
  }, []);

  // Function to filter object to only show selected columns
  const filterRow = (row) => {
    const filteredRow = {};
    columnsToShow.forEach(column => {
      if (column in row) {
        filteredRow[column] = row[column];
      }
    });
    return filteredRow;
  };

  if (!initialData || !initialData.data || initialData.data.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500 text-lg">No attendance data to show</div>
      </div>
    );
  }
  return (
    <div>
    
      {initialData && initialData.data && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columnsToShow.map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialData.data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row['Student Name']}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row['Unique Id.']}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    row['Attendance'] >= 75 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {row['Attendance']}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-sm text-gray-500">
            <div className="flex gap-4 justify-end">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                <span>≥ 75% (Good Attendance)</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                <span>&lt; 75% (Low Attendance)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;