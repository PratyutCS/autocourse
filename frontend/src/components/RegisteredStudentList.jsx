import React from 'react';

const RegisteredStudentList = ({ students }) => {
  // Check if students and students.data exist and is an array
  if (!students?.data || !Array.isArray(students.data)) {
    console.error('Expected students.data to be an array, but got:', students);
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500 text-lg">Error: Invalid student data</div>
      </div>
    );
  }

  if (students.data.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500 text-lg">No registered students to show</div>
      </div>
    );
  }

  const columns = [
    { key: 'Sr No.', label: 'Sr No.' },
    { key: 'Student Name', label: 'Student Name' },
    { key: 'Unique Id.', label: 'Unique ID' },
  ];

  return (
    <div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.data.map((student) => (
              <tr key={student['Sr No.']} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td 
                    key={`${student['Sr No.']}-${column.key}` }
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {student[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegisteredStudentList;