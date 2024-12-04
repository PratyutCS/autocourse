import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { File, X, FileSpreadsheet } from 'lucide-react';

const ExcelUploader = React.memo(({ 
  title, 
  identifier, 
  onFileChange, 
  initialData,
  hideUploaderAfterFileUpload = true 
}) => {
  const [fileContent, setFileContent] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const memoizedInitialData = useMemo(() => initialData, [initialData]);

  useEffect(() => {
    if (memoizedInitialData) {
      try {
        setError(null);
        const parsedData = typeof memoizedInitialData === 'string' 
          ? JSON.parse(memoizedInitialData) 
          : memoizedInitialData;
        
        if (parsedData?.content) {
          setFileContent(parsedData.content);
          setFileName(parsedData.fileName || '');
        } else if (Array.isArray(parsedData)) {
          setFileContent(parsedData);
        }
      } catch (error) {
        console.error('Error parsing initial data:', error);
        setError('Failed to load initial data');
      }
    }
  }, [memoizedInitialData]);

  const processFile = useCallback((file) => {
    setFileName(file.name);
    setError(null);

    if (file.type === "text/csv") {
      Papa.parse(file, {
        complete: (result) => {
          if (result.errors.length > 0) {
            setError('Error parsing CSV file');
            return;
          }
          
          const content = result.data.filter(row => 
            Object.values(row).some(value => value !== '')
          );
          
          setFileContent(content);
          onFileChange({
            content,
            fileName: file.name,
            type: file.type,
            lastModified: file.lastModified
          }, identifier);
        },
        header: true,
        skipEmptyLines: true
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
          
          setFileContent(content);
          onFileChange({
            content,
            fileName: file.name,
            type: file.type,
            lastModified: file.lastModified
          }, identifier);
        } catch (error) {
          console.error('Error processing Excel file:', error);
          setError('Error processing Excel file');
        }
      };

      reader.onerror = () => {
        setError('Error reading file');
      };

      reader.readAsArrayBuffer(file);
    }
  }, [identifier, onFileChange]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false
  });

  const handleRemoveFile = useCallback(() => {
    setFileContent(null);
    setFileName('');
    setError(null);
    onFileChange(null, identifier);
  }, [identifier, onFileChange]);

  const renderFileContent = useCallback(() => {
    if (!fileContent || !Array.isArray(fileContent) || fileContent.length === 0) {
      return null;
    }

    const headers = Object.keys(fileContent[0]);
    
    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">
              {fileName}
            </span>
            <span className="text-sm text-gray-500">
              ({fileContent.length} rows)
            </span>
          </div>
          <button 
            onClick={handleRemoveFile}
            className="text-red-500 hover:text-red-700 flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Remove</span>
          </button>
        </div>
        <div className="overflow-x-auto">
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
                <tr key={idx} className="hover:bg-gray-50">
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
      </div>
    );
  }, [fileContent, fileName, handleRemoveFile]);

  // If file is uploaded and hideUploaderAfterFileUpload is true, don't render uploader
  if (fileContent && hideUploaderAfterFileUpload) {
    return renderFileContent();
  }

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      )}
      
      {fileContent ? (
        renderFileContent()
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-[#FFB255] bg-orange-50' : 'border-gray-300 hover:border-[#FFB255]'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-3">
            <File className="w-10 h-10 text-gray-400" />
            <p className="text-gray-600">
              {isDragActive
                ? "Drop the file here..."
                : "Drag 'n' drop Excel/CSV file here, or click to select"}
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: .xlsx, .csv
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm mt-2 flex items-center space-x-2">
          <X className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

ExcelUploader.displayName = 'ExcelUploader';

export default ExcelUploader;