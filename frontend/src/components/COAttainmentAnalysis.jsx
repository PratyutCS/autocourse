import React from 'react';

const COAttainmentAnalysis = () => {
  // Sample data
  const courseOutcomes = [
    { name: 'Weights', co1: '45%', co2: '26%', co3: '29%' },
    { name: 'No. of students scored >=3', co1: 132, co2: 153, co3: 160 },
    { name: '% age of students scored >= 3', co1: '66%', co2: '76%', co3: '80%' },
    { name: 'Attainment Level', co1: 2, co2: 3, co3: 3 },
    { name: 'Overall Course Attainment', co1: 2.55, co2: null, co3: null },
  ];

  const targetAttainment = [
    { level: 3, text: '70% Students scoring more than the Target Percentage' },
    { level: 2, text: '60% Students scoring more than the Target Percentage' },
    { level: 1, text: '50% Students scoring more than the Target Percentage' },
  ];

  const programOutcomeContribution = [
    { co: 'CO1', attainment: 2.53, statement: 'To understand the core principles underlying data structures and their significance in problem-solving.', pso1: 1, pso2: null, pso3: null, pso4: 1 },
    { co: 'CO2', attainment: 2.52, statement: 'To apply various data structures effectively in solving specific technical and logical problems.', pso1: 3, pso2: 2, pso3: 3, pso4: 3 },
    { co: 'CO3', attainment: 2.59, statement: 'To analyze and compare the performance of different data structures in specific problem-solving scenarios.', pso1: 3, pso2: null, pso3: 3, pso4: 2 },
  ];

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">CO Attainment Measurement Analysis</h2>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Course Outcomes</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left border-b">Course Outcomes</th>
                <th className="px-4 py-2 text-center border-b">CO1</th>
                <th className="px-4 py-2 text-center border-b">CO2</th>
                <th className="px-4 py-2 text-center border-b">CO3</th>
              </tr>
            </thead>
            <tbody>
              {courseOutcomes.map((outcome, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                  <td className="px-4 py-2 text-left border-b">{outcome.name}</td>
                  <td className="px-4 py-2 text-center border-b">{outcome.co1}</td>
                  <td className="px-4 py-2 text-center border-b">{outcome.co2}</td>
                  <td className="px-4 py-2 text-center border-b">{outcome.co3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Target Attainment</h3>
          {targetAttainment.map((item, index) => (
            <div
              key={index}
              className={`p-4 mb-2 rounded-lg ${
                item.level === 3 ? 'bg-yellow-300' : item.level === 2 ? 'bg-yellow-400' : 'bg-yellow-500'
              }`}
            >
              <p className="text-gray-800 font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <h3 className="text-lg font-medium mt-8 mb-4">Contribution to attainment of Program Outcomes</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left border-b">CO</th>
            <th className="px-4 py-2 text-left border-b">Attainment</th>
            <th className="px-4 py-2 text-left border-b">STATEMENT</th>
            <th className="px-4 py-2 text-center border-b">PSO1</th>
            <th className="px-4 py-2 text-center border-b">PSO2</th>
            <th className="px-4 py-2 text-center border-b">PSO3</th>
            <th className="px-4 py-2 text-center border-b">PSO4</th>
          </tr>
        </thead>
        <tbody>
          {programOutcomeContribution.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
              <td className="px-4 py-2 text-left border-b">{item.co}</td>
              <td className="px-4 py-2 text-left border-b">{item.attainment}</td>
              <td className="px-4 py-2 text-left border-b">{item.statement}</td>
              <td className="px-4 py-2 text-center border-b">{item.pso1}</td>
              <td className="px-4 py-2 text-center border-b">{item.pso2}</td>
              <td className="px-4 py-2 text-center border-b">{item.pso3}</td>
              <td className="px-4 py-2 text-center border-b">{item.pso4}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default COAttainmentAnalysis;