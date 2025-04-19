import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import constants from '../constants';
import { Info } from 'lucide-react';

const ExcelToJSON = ({ onSave, initialData, selectedProgram }) => {
  const token = localStorage.getItem("token");
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [maxMarksData, setMaxMarksData] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  
  // Refs to track processing and prevent loops
  const dataProcessedRef = useRef(false);
  const lastProgramRef = useRef(selectedProgram);
  const lastFilteredDataCountRef = useRef(0);
  const processingRef = useRef(false);

  // Program mapping for filtering
  const programMapping = {
    1: ["B.Tech CSE", "B.Tech. (CSE)", "Computer Science Engineering", "CSE"],
    2: ["B.Tech ME", "B.Tech. (ME)", "Mechanical Engineering", "ME"],
    3: ["B.Tech ECE", "B.Tech. (ECE)", "Electronics and Computer Engineering", "ECE"],
    4: ["BBA", "Bachelor of Business Administration", "Bachelor of Business Administration (BBA)"],
    5: ["B.Com", "BCOM", "Bachelor of Commerce", "Bachelor of Commerce BCOM(Hons)", "B.Com (Hons.)"],
    6: ["Integrated BBA MBA", "IBM"],
    7: ["BA (Hons) Liberal Arts", "B.A. (Hons.)-LS", "BA Liberal Arts", "Liberal Arts"],
    8: ["BA LLB", "BA LLB (Hons)", "B.A., LL.B. (Hons.)"],
    9: ["BBA LLB", "BBA LLB (Hons)", "B.B.A., LL.B. (Hons.)"],
    10: ["MBA", "MBA (E)"]
  };

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
    // console.log('Cleaned max marks data:', cleanedData);
    return Object.keys(cleanedData).length > 0 ? cleanedData : null;
  };
  useEffect(() => {
    console.log('Filtered data updated:', filteredData);
  },[])

  // Filter data based on selected program
  const filterDataByProgram = useCallback((data) => {
    if (!data || !Array.isArray(data) || data.length === 0 || !selectedProgram) {
      return data;
    }

    // If no program is selected (0), return all data
    if (selectedProgram === 0) {
      return data;
    }

    // Get the possible program name variations for the selected program
    const programVariations = programMapping[selectedProgram] || [];
    
    // Filter the data to only show rows matching the selected program
    return data.filter(row => {
      const programName = row["Program Name"] || row["Program"] || "";
      
      // Check if the program name in the data matches any of the variations
      return programVariations.some(variation => 
        programName.toLowerCase().includes(variation.toLowerCase())
      );
    });
  }, [selectedProgram, programMapping]);

  // Helper function to save data to parent component - with debouncing
  const saveDataToParent = useCallback((maxMarks, filteredData, originalData) => {
    if (processingRef.current) return;
    console.log('Saving data to parent:',  originalData);
    
    // Skip if we don't have required data
    if (!maxMarks || !filteredData || !originalData) return;
    
    // Skip if nothing has changed
    const currentFilteredDataCount = filteredData.length;
    if (
      lastProgramRef.current === selectedProgram &&
      lastFilteredDataCountRef.current === currentFilteredDataCount &&
      dataProcessedRef.current
    ) {
      return;
    }
    
    // Mark as processing to prevent concurrent calls
    processingRef.current = true;
    
    try {
      // Update refs with current state
      lastProgramRef.current = selectedProgram;
      lastFilteredDataCountRef.current = currentFilteredDataCount;
      dataProcessedRef.current = true;
      
      // Send data in the proper structure to parent
      const studentData = { maxMarks, data: filteredData };
      const originalStudentData = { maxMarks, data: originalData };
      
      // Call parent save function with properly structured data
      onSave({ studentData, originalStudentData });
    } finally {
      // Reset processing flag
      processingRef.current = false;
    }
  }, [selectedProgram, onSave]);

  // Initialize the component with initialData
  useEffect(() => {
    if (initialData && initialData.data && initialData.maxMarks) {
      console.log('Initial data provided:', initialData);
      try {
        // Skip if we've already processed data (prevents loops)
        if (dataProcessedRef.current && filteredData) return;
        
        // Extract max marks from first row and clean it
        const maxMarks = cleanMaxMarksData(initialData.maxMarks);
        const remainingData = initialData.data;

        setMaxMarksData(maxMarks);
        setProcessedData(remainingData);
        
        // Apply filtering for the initial data
        const filtered = filterDataByProgram(remainingData);
        setFilteredData(filtered);
        
        // Mark as processed
        dataProcessedRef.current = true;
      } catch (error) {
        console.error('Error processing initial data:', error);
        setError('Error processing initial data');
      }
    }
  }, [initialData, filterDataByProgram]);

  // Update filtered data when program changes
  useEffect(() => {
    // Skip effect if we don't have data to filter
    if (!processedData) return;
    
    // Only re-filter if program selection changed
    if (lastProgramRef.current !== selectedProgram) {
      const newFiltered = filterDataByProgram(processedData);
      setFilteredData(newFiltered);
      lastProgramRef.current = selectedProgram;
      
      // Update parent component with the new filtered data
      if (maxMarksData && processedData) {
        saveDataToParent(maxMarksData, newFiltered, processedData);
      }
    }
  }, [selectedProgram, filterDataByProgram, processedData, maxMarksData, saveDataToParent]);

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
    setIsLoading(true);
    
    // Reset processed state when new file is uploaded
    dataProcessedRef.current = false;

    if (file.type === "text/csv") {
      Papa.parse(file, {
        complete: (result) => {
          if (result.errors.length > 0) {
            setError('Error parsing CSV file');
            setIsLoading(false);
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
            
            // Filter the data based on the selected program
            const filteredData = filterDataByProgram(remainingData);
            
            setMaxMarksData(maxMarks);
            setProcessedData(remainingData);
            setFilteredData(filteredData);
            
            // Save both filtered and original data
            saveDataToParent(maxMarks, filteredData, remainingData);
            
            setIsLoading(false);
          } catch (error) {
            console.error('Error processing CSV data:', error);
            setError('Error processing CSV data');
            setIsLoading(false);
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
            setIsLoading(false);
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
          
          // Filter the data based on the selected program
          const filteredData = filterDataByProgram(remainingData);

          setMaxMarksData(maxMarks);
          setProcessedData(remainingData);
          setFilteredData(filteredData);
          
          // Save both filtered and original data
          saveDataToParent(maxMarks, filteredData, remainingData);
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error processing Excel file:', error);
          setError('Error processing Excel file');
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Error reading file');
        setIsLoading(false);
      };

      reader.readAsArrayBuffer(file);
    }
  }, [filterDataByProgram, saveDataToParent]);

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
    multiple: false,
    onDragEnter: () => setIsHovering(true),
    onDragLeave: () => setIsHovering(false)
  });

  const renderPreview = () => {
    if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
      return (
        <div className="mt-6 text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          {processedData && processedData.length > 0 ? (
            <div className="text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-lg font-medium">No data found for the selected program</p>
              <p className="text-sm mt-1">Please select a different program or upload data containing this program.</p>
            </div>
          ) : (
            <p className="text-gray-500">No data available for preview. Please upload a file.</p>
          )}
        </div>
      );
    }

    // Ensure we have valid data with headers
    const firstRow = filteredData[0];
    if (!firstRow) {
      return null;
    }

    const headers = Object.keys(firstRow);
    if (headers.length === 0) {
      return null;
    }

    const displayRows = showFullPreview ? filteredData : filteredData.slice(0, 5);

    return (
      <div className="mt-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Data Preview {selectedProgram > 0 && <span className="ml-2 text-sm bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Filtered by Program</span>}
          </h3>
          {filteredData.length > 5 && (
            <button 
              onClick={() => setShowFullPreview(!showFullPreview)}
              className="text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors focus:outline-none"
            >
              {showFullPreview ? "Show Less" : "Show All Rows"}
            </button>
          )}
        </div>

        {/* Display stats about filtered vs total data */}
        {processedData && processedData.length > 0 && (
          <div className="mb-3 text-sm text-gray-600">
            Showing {filteredData.length} {filteredData.length === 1 ? 'student' : 'students'} 
            {selectedProgram > 0 ? ` for selected program` : ''}
            {processedData.length !== filteredData.length && ` out of ${processedData.length} total`}
          </div>
        )}

        {/* Display Maximum Marks - Only if there are valid values */}
        {maxMarksData && Object.keys(maxMarksData).length > 0 && (
          <div className="mb-6 p-5 bg-gray-300/10 rounded-lg border border-black/10 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Maximum Attainable Marks
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(maxMarksData).map(([key, value]) => (
                <div key={key} className="bg-white p-3 rounded shadow-sm border border-black/10">
                  <p className="font-medium text-gray-800 text-sm mb-1">{key}</p>
                  <p className="text-lg font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-orange-50 transition-colors">
                  {headers.map((header) => (
                    <td
                      key={`${idx}-${header}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                    >
                      {row[header]?.toString() || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!showFullPreview && filteredData.length > 5 && (
          <div className="mt-3 text-sm text-gray-500 text-center flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Showing first 5 rows of {filteredData.length} total rows
          </div>
        )}
      </div>
    );
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${constants.url}/download/xlsx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "x-auth-token": token,
          "ngrok-skip-browser-warning": "69420"
        },
        body: JSON.stringify({})
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'sample.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setIsLoading(false);
    } catch (error) {
      console.error('Error downloading the file:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            10
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Student Assessment Data
          </h2>
          <span>(Please upload the data according to the specified template provided on the right-hand side.)</span>
        </div>
        
        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="flex items-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg shadow-md transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
          )}
          Download Data Template Sample
        </button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p>
            The Attendance list, Registered Student List, and Detailed marks will be generated automatically when you upload the data in the specified format. Please download the template to check the required format.
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p>
            Note: Total Marks column should be 100 in the data
          </p>
        </div>
      </div>

      {/* Program filtering indicator */}
      {selectedProgram > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-amber-700">
            <p className="font-medium">Program Filter Active</p>
            <p>Showing only student data for the selected program. All data will still be saved.</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragActive || isHovering
              ? 'border-orange-400 bg-orange-50 shadow-inner scale-[1.01]'
              : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-3">
            <svg
              className={`w-12 h-12 ${
                isDragActive || isHovering ? 'text-orange-500' : 'text-gray-400'
              } transition-colors`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12"
              ></path>
            </svg>
            <div>
              <p className={`font-medium ${
                isDragActive || isHovering ? 'text-orange-600' : 'text-gray-700'
              } transition-colors`}>
                {isDragActive
                  ? "Drop the file here..."
                  : "Drag and drop Excel/CSV file here"}
              </p>
              <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
              <p className="text-xs text-gray-400 mt-2">Supported formats: .xlsx, .csv</p>
            </div>
          </div>
          {fileName && !isLoading && (
            <div className="mt-4 flex items-center justify-center text-sm">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-gray-600">Current file: <span className="font-medium">{fileName}</span></span>
            </div>
          )}
          {isLoading && (
            <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing file...
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p className="font-medium text-red-800">Error Processing File</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {fileName && !error && !isLoading && (
          <div className="flex items-start p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm">
            <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p className="font-medium text-green-800">Success!</p>
              <p className="text-sm text-green-600 mt-1">
                File processed successfully. {processedData?.length} records loaded
                {selectedProgram > 0 && filteredData && ` (${filteredData.length} matching selected program)`}.
              </p>
            </div>
          </div>
        )}

        {/* Render the preview table */}
        {renderPreview()}
      </div>
    </div>
  );
};

export default ExcelToJSON;