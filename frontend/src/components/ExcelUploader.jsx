import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const ExcelUploader = ({ title, identifier, onFileChange, initialData }) => {
  const [fileContent, setFileContent] = useState(null);
  const [fileName, setFileName] = useState('');

  // Enhanced initialization with logging
  useEffect(() => {
    console.log('Initial data received:', initialData);
    if (initialData) {
      try {
        // If initialData is a string, try to parse it
        const parsedData = typeof initialData === 'string' 
          ? JSON.parse(initialData) 
          : initialData;
        
        if (parsedData?.content) {
          console.log('Setting file content:', parsedData.content);
          setFileContent(parsedData.content);
          setFileName(parsedData.fileName || '');
        } else if (Array.isArray(parsedData)) {
          console.log('Setting array content:', parsedData);
          setFileContent(parsedData);
        }
      } catch (error) {
        console.error('Error parsing initial data:', error);
      }
    }
  }, [initialData]);

  const processFile = (file) => {
    setFileName(file.name);

    if (file.type === "text/csv") {
      Papa.parse(file, {
        complete: (result) => {
          const content = result.data;
          console.log('Parsed CSV content:', content);
          setFileContent(content);
          onFileChange({
            content,
            fileName: file.name,
            type: file.type,
            lastModified: file.lastModified
          }, identifier);
        },
        header: true,
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const content = XLSX.utils.sheet_to_json(worksheet);
          console.log('Parsed Excel content:', content);
          setFileContent(content);
          onFileChange({
            content,
            fileName: file.name,
            type: file.type,
            lastModified: file.lastModified
          }, identifier);
        } catch (error) {
          console.error('Error processing Excel file:', error);
          alert('Error processing file. Please try again.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      processFile(file);
    }
  }, [identifier, onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const renderFileContent = () => {
    console.log('Rendering file content:', fileContent);
    
    if (!fileContent || !Array.isArray(fileContent) || fileContent.length === 0) {
      return null;
    }

    const headers = Object.keys(fileContent[0]);
    
    return (
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
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
            {fileContent.slice(0, 5).map((row, idx) => (
              <tr key={idx}>
                {headers.map((header) => (
                  <td
                    key={`${idx}-${header}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {row[header]?.toString() || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {fileContent.length > 5 && (
          <p className="mt-2 text-sm text-gray-500 text-center">
            Showing first 5 rows of {fileContent.length} total rows
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-[#FFB255] bg-orange-50' : 'border-gray-300 hover:border-[#FFB255]'}`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive
            ? "Drop the files here..."
            : "Drag 'n' drop Excel/CSV files here, or click to select"}
        </p>
        {fileName && (
          <p className="mt-2 text-sm text-gray-500">
            Current file: {fileName}
          </p>
        )}
      </div>
      {renderFileContent()}
    </div>
  );
};

export default ExcelUploader;