import React from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

const COAttainmentUploader = ({ 
  assessments,
  coWeightages,
  targetLevels,
  onProcessComplete 
}) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const processed = processData(jsonData);
        onProcessComplete(processed);
      };
      
      reader.readAsArrayBuffer(file);
    }
  });

  const processData = (rawData) => {
    const headers = rawData[0];
    const studentRows = rawData.slice(1);
    
    return studentRows.map(row => {
      const student = { marks: {}, attainment: {} };
      
      headers.forEach((header, index) => {
        if (header === 'Student Name' || header === 'Roll No') {
          student[header.toLowerCase().replace(' ', '_')] = row[index];
        } else if (assessments.some(a => a.name === header)) {
          student.marks[header] = parseFloat(row[index]) || 0;
        }
      });
      
      // Calculate CO attainment
      Object.keys(coWeightages).forEach(co => {
        student.attainment[co] = calculateCOAttainment(student.marks, co);
      });
      
      // Determine levels
      student.levels = determineAttainmentLevels(student.attainment, targetLevels);
      
      return student;
    });
  };

  const calculateCOAttainment = (marks, co) => {
    return Object.entries(coWeightages[co]).reduce((total, [assessment, weight]) => {
      const maxMarks = assessments.find(a => a.name === assessment)?.maxMarks || 100;
      const percentage = (marks[assessment] / maxMarks) * 100;
      return total + (percentage * (weight / 100));
    }, 0);
  };

  const determineAttainmentLevels = (attainment, targets) => {
    const sortedTargets = [...targets].sort((a, b) => b.percentage - a.percentage);
    const levels = {};
    
    Object.entries(attainment).forEach(([co, score]) => {
      const level = sortedTargets.find(t => score >= t.percentage)?.number || 0;
      levels[co] = level;
    });
    
    return levels;
  };

  return (
    <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8 text-center">
      <input {...getInputProps()} />
      <button>
        Upload Assessment Marks (CSV/Excel)
      </button>
      <p className="mt-2 text-sm text-gray-500">
        Drag & drop or click to upload student marks file
      </p>
    </div>
  );
};

export default COAttainmentUploader;