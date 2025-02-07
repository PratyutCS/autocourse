import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const COAttainmentAnalysis = ({ coWeightages, studentData, coAttainmentCriteria }) => {
  const [studentPerformance, setStudentPerformance] = useState([]);

  useEffect(() => {
    if (coWeightages && studentData && coAttainmentCriteria) {
      calculateAttainment();
    }
  }, [coWeightages, studentData, coAttainmentCriteria]);

  const calculateAttainment = () => {
    const performanceData = [];
    
    // Extract COs from weightages
    const cos = Object.keys(coWeightages);
    
    // Calculate individual student performance first
    if (studentData?.maxMarks && studentData?.data) {
      const assessmentComponents = Object.entries(studentData.maxMarks).slice(0, -1);
      
      studentData.data.forEach((student, index) => {
        const studentResult = {
          id: index + 1,
          rollNumber: student.rollNumber || `Student ${index + 1}`,
          coScores: {}
        };

        // Calculate CO-wise scores for each student
        cos.forEach(co => {
          let weightedScore = 0;
          let totalWeight = 0;

          assessmentComponents.forEach(([component, maxMark]) => {
            const studentScore = student[component] || 0;
            const coWeight = parseFloat(coWeightages[co][component.toLowerCase()] || 0);

            weightedScore += (studentScore * (coWeight / 100));
            totalWeight += (maxMark * (coWeight / 100));
          });

          let partial = coAttainmentCriteria[co].partial;
          let full = coAttainmentCriteria[co].full;

          console.log("partial: "+partial+" full: "+full);
          
          let percentage = 0;


          if(totalWeight > 0){
            percentage = ((weightedScore / totalWeight)*100).toFixed(2);
          }
          

          if(percentage >= full){
            studentResult.coScores[co] = 3;
          }
          else if(percentage < full && percentage >= partial){
            studentResult.coScores[co] = 2;
          }
          else{
            studentResult.coScores[co] = 1;
          }
        });

        performanceData.push(studentResult);
      });
    }

    setStudentPerformance(performanceData);
  };

  if (!coWeightages || !studentData || !coAttainmentCriteria) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            20
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            CO Attainment Analysis
          </h2>
        </div>

        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg">
            Missing Required Data
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please ensure CO weightages, student data, and attainment criteria are provided
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
          20
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          CO Attainment Analysis
        </h2>
      </div>

      <div className="space-y-8">
        {/* Individual Student Performance */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student-wise CO Achievement</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  {Object.keys(coWeightages).map(co => (
                    <th key={co} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {co} Score
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentPerformance.map(student => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.rollNumber}
                    </td>
                    {Object.keys(coWeightages).map(co => (
                      <td key={`${student.id}_${co}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.coScores[co]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default COAttainmentAnalysis;