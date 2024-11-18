import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const ExcelUploader = ({ title, identifier, onFileChange, initialData }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(initialData || null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setFile(file);

    if (file.type === 'text/csv') {
      Papa.parse(file, {
        complete: (result) => {
          const processedData = {
            fileName: file.name,
            type: 'csv',
            content: result.data,
            uploadedAt: new Date().toISOString()
          };
          setData(processedData);
          onFileChange && onFileChange(identifier, processedData);
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
        
        const processedData = {
          fileName: file.name,
          type: 'xlsx',
          content: json,
          uploadedAt: new Date().toISOString()
        };
        setData(processedData);
        onFileChange && onFileChange(identifier, processedData);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [onFileChange, identifier]);

  const removeFile = () => {
    setFile(null);
    setData(null);
    onFileChange && onFileChange(identifier, null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  return (
    <div className="mb-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      )}
      <div {...getRootProps()} className="file-upload-area border-2 border-dashed border-gray-300 p-8 text-center rounded cursor-pointer hover:border-orange-400 transition-colors">
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
    </div>
  );
};

export default ExcelUploader;