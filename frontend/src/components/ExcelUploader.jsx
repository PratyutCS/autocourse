import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const ExcelUploader = ({ title, onFileChange }) => {
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setFile(file);

    if (file.type === 'text/csv') {
      Papa.parse(file, {
        complete: (result) => {
          setFileContent(result.data);
          onFileChange && onFileChange(result.data);
        },
        header: true,
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setFileContent(json);
        onFileChange && onFileChange(json);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [onFileChange]);

  const removeFile = () => {
    setFile(null);
    setFileContent(null);
    onFileChange && onFileChange(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  return (
    <div>
      <div {...getRootProps()} className="file-upload-area border-2 border-dashed border-gray-300 p-8 text-center rounded cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-gray-500">Drop the file here ...</p>
        ) : (
          <p className="text-gray-500">Drag & drop a CSV or XLSX file here, or click to select a file</p>
        )}
      </div>
      
      {file && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-gray-600">📄</span>
            <span className="ml-2 text-gray-700">{file.name}</span>
          </div>
          <button
            onClick={removeFile}
            className="text-red-500 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      )}

      {fileContent && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                {Object.keys(fileContent[0]).map((header) => (
                  <th key={header} className="px-4 py-2 border-b bg-gray-100">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fileContent.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  {Object.values(row).map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2 border-b">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExcelUploader;