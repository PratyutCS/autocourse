import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const ExcelUploader = ({ title, identifier, onFileChange, initialData }) => {
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState(initialData || null);

  const processFile = (data) => {
    const formattedData = {
      fileName: file?.name || "",
      uploadDate: new Date().toISOString(),
      data: data,
    };
  
    setFileData(formattedData);
    onFileChange && onFileChange(formattedData, identifier); // Ensure correct order
  };
  

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setFile(file);

    if (file.type === 'text/csv') {
      Papa.parse(file, {
        complete: (result) => {
          processFile(result.data);
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
        processFile(json);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file, identifier, onFileChange]);

  const removeFile = () => {
    setFile(null);
    setFileData(null);
    onFileChange && onFileChange(null, identifier);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors p-8 rounded-lg cursor-pointer"
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <div className="text-gray-500 mb-2">
            {isDragActive ? (
              <p>Drop the file here ...</p>
            ) : (
              <>
                <p className="mb-2">Drag & drop a CSV or XLSX file here</p>
                <p className="text-sm">or click to select a file</p>
              </>
            )}
          </div>
        </div>
      </div>

      {(file || fileData) && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">📄</span>
            <span className="text-gray-700">{file?.name || fileData?.fileName}</span>
          </div>
          <button
            onClick={removeFile}
            className="text-red-500 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
          >
            Remove
          </button>
        </div>
      )}

      {fileData && fileData.data && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                {Object.keys(fileData.data[0] || {}).map((header) => (
                  <th key={header} className="px-4 py-2 bg-gray-50 text-left text-gray-600 border-b">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fileData.data.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2 border-b text-gray-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {fileData.data.length > 5 && (
            <p className="mt-2 text-gray-500 text-sm">
              Showing first 5 rows of {fileData.data.length} total rows
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExcelUploader;