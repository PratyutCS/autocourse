import React, { useCallback, memo } from 'react';
import { Check, X } from 'lucide-react';

const StudentTableHeader = () => (
  <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-50 font-medium text-gray-600 border-b">
    <div>Student ID</div>
    <div>Name</div>
    <div className="text-right">Actions</div>
  </div>
);

const StudentActions = memo(({ student, onStatusChange }) => 

  {
    console.log(student, "Student Data")
    return(
  <div className="flex justify-end space-x-2">
    <button
      className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
        student.status === 'Accepted'
          ? 'bg-[#FFB255] text-white cursor-not-allowed'
          : 'bg-white border border-[#FFB255] text-[#FFB255] hover:bg-[#FFB255] hover:text-white transition-colors'
      }`}
      disabled={student.status === 'Accepted'}
      onClick={() => onStatusChange(student.uniqueId, 'Accepted')}
      aria-label={`Accept student ${student.studentName}`}
    >
      <Check className="w-4 h-4 mr-1" />
      Accept
    </button>
    <button
      className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
        student.status === 'Rejected'
          ? 'bg-gray-600 text-white cursor-not-allowed'
          : 'bg-white border border-gray-400 text-gray-600 hover:bg-gray-600 hover:text-white transition-colors'
      }`}
      disabled={student.status === 'Rejected'}
      onClick={() => onStatusChange(student.uniqueId, 'Rejected')}
      aria-label={`Reject student ${student.studentName}`}
    >
      <X className="w-4 h-4 mr-1" />
      Reject
    </button>
  </div>)
});

StudentActions.displayName = 'StudentActions';

const EmptyState = () => (
  <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
    <p className="text-gray-600 font-semibold text-lg">
      No students identified yet
    </p>
    <p className="text-sm text-gray-500 mt-2">
      Upload an Excel file to view and manage students
    </p>
  </div>
);

const WeakStudent = ({
  weakStudentsData,
  handleStudentStatusChange,
  removeRejectedStudents,
}) => {
  const students = Array.isArray(weakStudentsData) ? weakStudentsData : [];
  
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'Accepted':
        return 'text-green-600';
      case 'Rejected':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  }, []);

  const StudentRow = memo(({ student }) => (
    <div
      className="grid grid-cols-3 gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
    >
      <div className="text-gray-600 self-center">{student.uniqueId}</div>
      <div>
        <div className="text-gray-800 font-medium">{student.studentName}</div>
        <div className={`text-sm font-medium ${getStatusColor(student.status)}`}>
          Status: {student.status || 'Pending'}
        </div>
      </div>
      <StudentActions 
        student={student} 
        onStatusChange={handleStudentStatusChange} 
      />
    </div>
  ));
  
  StudentRow.displayName = 'StudentRow';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Student List</h3>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <StudentTableHeader />
        
        {students.length > 0 ? (
          students.map((student) => (
            <StudentRow key={student.uniqueId} student={student} />
          ))
        ) : (
          <EmptyState />
        )}
      </div>

      {students.length > 0 && (
        <button
          className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={removeRejectedStudents}
          aria-label="Remove all rejected students"
        >
          Remove Rejected Students
        </button>
      )}
    </div>
  );
};

WeakStudent.displayName = 'WeakStudent';

export default memo(WeakStudent);