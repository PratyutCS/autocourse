import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const ExcelToJSON = ({ onSave, initialData }) => {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [maxMarksData, setMaxMarksData] = useState(null);

  // console.log("INITIAL DATA IS : ", initialData);

  // Function to clean max marks data by removing undefined/empty values
  const cleanMaxMarksData = (data) => {
    if (!data) return null;
    
    const cleanedData = {};
    Object.entries(data).forEach(([key, value]) => {
      // Only keep the key-value pair if value is defined and not empty
      if (value !== undefined && value !== null && value !== '') {
        cleanedData[key] = value;
      }
    });
    return Object.keys(cleanedData).length > 0 ? cleanedData : null;
  };

  // Initialize the component with initialData
  useEffect(() => {
    if (initialData && initialData.data && initialData.maxMarks) {
      // console.log('Setting initial data:', initialData);
      try {
        // Extract max marks from first row and clean it
        const maxMarks = cleanMaxMarksData(initialData.maxMarks);
        const remainingData = initialData.data;

        // console.log('Cleaned max marks:', maxMarks);
        // console.log('Remaining data:', remainingData);

        setMaxMarksData(maxMarks);
        setProcessedData(remainingData);
      } catch (error) {
        console.error('Error processing initial data:', error);
        setError('Error processing initial data');
      }
    }
  }, [initialData]);

  // Function to find the starting row of actual data
  const findTableStart = (data) => {
    const headerIndicators = ['unique id', 'assessment', 'student name', 'id'];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowValues = Object.values(row).map(val =>
        String(val).toLowerCase().trim()
      );

      if (rowValues.some(value =>
        headerIndicators.some(indicator => value.includes(indicator))
      )) {
        return i;
      }
    }
    return 0;
  };

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

          try {
            let data = result.data.filter(row =>
              Object.values(row).some(value => value !== '')
            );

            const startIndex = findTableStart(data);
            const headers = Object.keys(data[startIndex]);
            const processedData = data.slice(startIndex + 1).map(row => {
              let newRow = {};
              headers.forEach((header, index) => {
                newRow[data[startIndex][header]] = row[header];
              });
              return newRow;
            });

            // Extract and clean max marks from the first row
            const maxMarks = cleanMaxMarksData(processedData[0]);
            const remainingData = processedData.slice(1);

            setMaxMarksData(maxMarks);
            setProcessedData(remainingData);
            onSave({ maxMarks, data: remainingData });
          } catch (error) {
            console.error('Error processing CSV data:', error);
            setError('Error processing CSV data');
          }
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

          let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const startIndex = jsonData.findIndex(row =>
            row.some(cell =>
              typeof cell === 'string' &&
              ['unique id', 'assessment', 'student name', 'id'].some(
                indicator => String(cell).toLowerCase().includes(indicator)
              )
            )
          );

          if (startIndex === -1) {
            setError('Could not find table headers');
            return;
          }

          const headers = jsonData[startIndex];

          const processedData = jsonData.slice(startIndex + 1)
            .filter(row => row.some(cell => cell !== ''))
            .map(row => {
              let obj = {};
              headers.forEach((header, index) => {
                if (header) {
                  obj[header] = row[index];
                }
              });
              return obj;
            });

          // Extract and clean max marks from the first row
          const maxMarks = cleanMaxMarksData(processedData[0]);
          const remainingData = processedData.slice(1);

          setMaxMarksData(maxMarks);
          setProcessedData(remainingData);
          onSave({ maxMarks, data: remainingData });
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
  }, [onSave]);

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

  const renderPreview = () => {
    if (!processedData || !Array.isArray(processedData) || processedData.length === 0) {
      // console.log('No data to display');
      return null;
    }

    // Ensure we have valid data with headers
    const firstRow = processedData[0];
    if (!firstRow) {
      // console.log('No rows in processed data');
      return null;
    }

    const headers = Object.keys(firstRow);
    if (headers.length === 0) {
      // console.log('No headers found in data');
      return null;
    }

    return (
      <div className="mt-4 overflow-x-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-700">Preview</h3>
        </div>

        {/* Display Maximum Marks - Only if there are valid values */}
        {maxMarksData && Object.keys(maxMarksData).length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Maximum Attainable Marks:</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(maxMarksData).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium text-yellow-700">{key}:</span>
                  <span className="ml-2 text-yellow-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Table */}
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
            {processedData.slice(0, 5).map((row, idx) => (
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
        {processedData.length > 5 && (
          <p className="mt-2 text-sm text-gray-500 text-center">
            Showing first 5 rows of {processedData.length} total rows
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
          <span>9</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Excel/CSV to JSON Converter
        </h2>
      </div>

      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-[#FFB255] bg-orange-50' : 'border-gray-300 hover:border-[#FFB255]'}`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">
            {isDragActive
              ? "Drop the file here..."
              : "Drag 'n' drop Excel/CSV file here, or click to select"}
          </p>
          {fileName && (
            <p className="mt-2 text-sm text-gray-500">
              Current file: {fileName}
            </p>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {fileName && !error && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <p className="text-green-600 text-sm">
              File processed successfully!
            </p>
          </div>
        )}

        {/* Render the preview table */}
        {renderPreview()}
      </div>
    </div>
  );
};

export default ExcelToJSON;