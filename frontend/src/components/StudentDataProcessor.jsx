import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
// import { Table } from '@/components/ui/Table';
import { Alert, AlertDescription } from '@/components/ui/alert';

const StudentDataProcessor = ({ fileData }) => {
  const [processedData, setProcessedData] = useState({
    registeredStudents: [],
    weakStudents: [],
    marksDetails: [],
    attendanceReport: []
  });
  
  const [statistics, setStatistics] = useState({
    averageMarks: 0,
    passRate: 0,
    weakStudentCount: 0,
    attendanceConcern: 0
  });

  useEffect(() => {
    if (!fileData || !fileData.length) return;

    const processStudentData = (data) => {
      // Convert data to consistent format
      const formattedData = data.map(row => ({
        id: row['Unique Id'] || '',
        name: row['Student Name'] || '',
        presentation: parseFloat(row['Presentation(10)']) || 0,
        project: parseFloat(row['Project(70)']) || 0,
        quiz: parseFloat(row['Quiz non ERP(20)']) || 0,
        total: parseFloat(row['Total Marks']) || 0,
        grade: row['Grade'] || '',
        attendance: parseFloat(row['Attendance']) || 0
      }));

      // Calculate statistics
      const totalStudents = formattedData.length;
      const avgMarks = formattedData.reduce((acc, curr) => acc + curr.total, 0) / totalStudents;
      const passCount = formattedData.filter(student => student.grade !== 'R').length;
      const weakStudents = formattedData.filter(student => student.total < 60 || student.attendance < 75);
      const lowAttendance = formattedData.filter(student => student.attendance < 75);

      setStatistics({
        averageMarks: avgMarks.toFixed(2),
        passRate: ((passCount / totalStudents) * 100).toFixed(2),
        weakStudentCount: weakStudents.length,
        attendanceConcern: lowAttendance.length
      });

      return {
        registeredStudents: formattedData,
        weakStudents,
        marksDetails: formattedData,
        attendanceReport: formattedData.map(student => ({
          id: student.id,
          name: student.name,
          attendance: student.attendance
        }))
      };
    };

    setProcessedData(processStudentData(fileData));
  }, [fileData]);

  const renderPerformanceChart = () => {
    const chartData = processedData.registeredStudents.map(student => ({
      name: student.name.split(' ')[0],
      total: student.total,
      attendance: student.attendance
    }));

    return (
      <div className="w-full p-4">
        <BarChart width={800} height={300} data={chartData} className="mt-4">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#FFB255" name="Total Marks" />
          <Bar dataKey="attendance" fill="#82ca9d" name="Attendance %" />
        </BarChart>
      </div>
    );
  };

  const renderStatistics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {[
        { label: 'Average Marks', value: statistics.averageMarks },
        { label: 'Pass Rate', value: `${statistics.passRate}%` },
        { label: 'Weak Students', value: statistics.weakStudentCount },
        { label: 'Attendance Concern', value: statistics.attendanceConcern }
      ].map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600">{stat.label}</h3>
          <p className="text-2xl font-bold text-[#FFB255]">{stat.value}</p>
        </div>
      ))}
    </div>
  );

  const renderWeakStudentsAlert = () => {
    if (processedData.weakStudents.length > 0) {
      return (
        <Alert className="mt-4">
          <AlertDescription>
            {processedData.weakStudents.length} students require additional support.
            These students have either scored below 60% or have attendance below 75%.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {processedData.registeredStudents.length > 0 ? (
        <>
          {renderStatistics()}
          {renderWeakStudentsAlert()}
          {renderPerformanceChart()}
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Total Marks</th>
                  <th className="px-6 py-3">Grade</th>
                  <th className="px-6 py-3">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {processedData.registeredStudents.map((student, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{student.id}</td>
                    <td className="px-6 py-4">{student.name}</td>
                    <td className="px-6 py-4">{student.total}</td>
                    <td className="px-6 py-4">{student.grade}</td>
                    <td className="px-6 py-4">{student.attendance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center p-8 text-gray-500">
          No student data available. Please upload a file.
        </div>
      )}
    </div>
  );
};

export default StudentDataProcessor;