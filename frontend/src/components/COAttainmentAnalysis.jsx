import React from 'react';

const COAttainmentAnalysis = ({
  coWeightages,
  coAttainmentCriteria,
  copoMappingData,
  marksDetailsData,
  studentListData = []
}) => {
  // 1. Calculate weights
  const weights = Object.entries(coWeightages).reduce((acc, [co, weight]) => {
    acc[co] = `${weight}%`; // Ensure weight is a number to avoid 'NaN%'
    return acc;
  }, {});

  // 2. Calculate students scoring >=3 for each CO
  const calculateStudentsAboveThreshold = () => {
    const coScores = {};
    
    marksDetailsData.forEach(student => {
      Object.keys(coWeightages).forEach(co => {
        if (!coScores[co]) coScores[co] = { total: 0, above: 0 };
        
        const score = student[co] || 0;
        const threshold = coAttainmentCriteria[co]?.full || 0;
        
        coScores[co].total++;
        if (score >= threshold) coScores[co].above++;
      });
    });
    
    return coScores;
  };

  // 3. Calculate attainment levels
  const calculateAttainmentLevels = (coScores) => {
    return Object.entries(coScores).reduce((acc, [co, scores]) => {
      const percentage = (scores.above / scores.total) * 100;
      const fullThreshold = coAttainmentCriteria[co]?.full || 0;
      const partialThreshold = coAttainmentCriteria[co]?.partial || 0;

      let level = 1;
      if (percentage >= fullThreshold) level = 3;
      else if (percentage >= partialThreshold) level = 2;

      acc[co] = level;
      return acc;
    }, {});
  };

  // 4. Calculate PO contributions
  const calculatePOContributions = () => {
    return Object.entries(copoMappingData.mappingData).map(([co, poMap]) => ({
      co,
      attainment: weights[co] || '0%', // Use formatted weight here
      statement: copoMappingData.courseOutcomes[co] || '',
      ...poMap
    }));
  };
  // Dynamic calculations
  const coScores = calculateStudentsAboveThreshold();
  const attainmentLevels = calculateAttainmentLevels(coScores);
  const poContributions = calculatePOContributions();
  const totalStudents = studentListData.length;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
     <h3 className="text-lg font-medium mt-8 mb-4">Contribution to Program Outcomes</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left border-b">CO</th>
            <th className="px-4 py-2 text-left border-b">Attainment</th>
            <th className="px-4 py-2 text-left border-b">Statement</th>
            {Object.keys(copoMappingData.programOutcomes || {}).map(po => (
              <th key={po} className="px-4 py-2 text-center border-b">{po}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {poContributions.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
              <td className="px-4 py-2 text-left border-b">{item.co}</td>
              <td className="px-4 py-2 text-left border-b">{item.attainment}</td>
              <td className="px-4 py-2 text-left border-b">
                {/* Handle object-structured statements */}
                {typeof item.statement === 'object' ? (
                  <div>
                    <p className="font-medium">{item.statement.description}</p>
                    <ul className="list-disc pl-4 mt-1">
                      {item.statement.bullets?.map((bullet, i) => (
                        <li key={i} className="text-sm text-gray-600">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  // Handle string statements
                  item.statement
                )}
              </td>
              {Object.keys(copoMappingData.programOutcomes || {}).map(po => (
                <td key={po} className="px-4 py-2 text-center border-b">
                  {typeof item[po] === 'object' ? (
                    Object.entries(item[po]).map(([key, value]) => (
                      <div key={key}>{`${key}: ${value}`}</div>
                    ))
                  ) : (
                    item[po] || '-'
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default COAttainmentAnalysis;