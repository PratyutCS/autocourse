import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Trash2, Upload, FileText, AlertCircle, Check, Eye } from 'lucide-react';
import constants from "../constants";

const PDFUploader = ({ num, onUploadSuccess, onDeleteSuccess, initialFileName }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentFileName, setCurrentFileName] = useState(initialFileName || '');
  const [viewUrl, setViewUrl] = useState('');
  const [isViewing, setIsViewing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfData, setPdfData] = useState(null); // For storing the PDF blob

  // When component mounts, fetch the file information from the server
  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        setIsLoading(true);
        // Fetch the current user's data for this specific num
        const response = await axios.post(constants.url + '/numdata', { num }, {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
            'ngrok-skip-browser-warning': '69420'
          }
        });
        
        // Check if there's an assignmentPDF entry
        if (response.data && response.data.assignmentPDF) {
          setCurrentFileName(response.data.assignmentPDF);
        } else if (initialFileName) {
          setCurrentFileName(initialFileName);
        }
      } catch (error) {
        console.error('Error fetching file info:', error);
        setError('Could not retrieve file information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFileInfo();
  }, [num, initialFileName]);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a valid PDF file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 50 * 1024 * 1024, // 50MB limit
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setError('');
      
      // Use a dedicated endpoint for assignment PDFs
      const response = await axios.post(constants.url + '/upload-assignment-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'num': num,
          'x-auth-token': localStorage.getItem('token'),
          'ngrok-skip-browser-warning': '69420'
        }
      });

      setSuccess('File uploaded successfully!');
      setCurrentFileName(response.data.filename);
      if (onUploadSuccess) onUploadSuccess(response.data.filename);
      setFile(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setUploading(true);
      setError('');

      // Use a dedicated endpoint for deleting assignment PDFs
      await axios.post(constants.url + '/delete-assignment-pdf', {}, {
        headers: {
          'num': num,
          'x-auth-token': localStorage.getItem('token'),
          'ngrok-skip-browser-warning': '69420'
        }
      });

      setSuccess('File deleted successfully!');
      setCurrentFileName('');
      setViewUrl('');
      setIsViewing(false);
      setPdfData(null);
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting file');
    } finally {
      setUploading(false);
    }
  };

  const handleView = async () => {
    if (!currentFileName) {
      setError('No file available to view');
      return;
    }
    
    try {
      setUploading(true);
      setError('');
      
      // Fetch the PDF as a blob with authentication headers
      const response = await axios.get(`${constants.url}/get-assignment-pdf/${currentFileName}`, {
        responseType: 'blob',
        headers: {
          'x-auth-token': localStorage.getItem('token'),
          'ngrok-skip-browser-warning': '69420'
        }
      });
      
      // Create a local URL for the blob data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setViewUrl(url);
      setPdfData(blob);
      setIsViewing(true);
    } catch (error) {
      setError('Error retrieving PDF file');
      console.error('PDF retrieval error:', error);
    } finally {
      setUploading(false);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (viewUrl) {
        URL.revokeObjectURL(viewUrl);
      }
    };
  }, [viewUrl]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
            17
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Assignments/Quiz/Projects with Sample Solution
          </h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
          17
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Assignments/Quiz/Projects with Sample Solution
        </h2>
      </div>

      {/* Current File Display */}
      {currentFileName && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-[#FFB255] w-5 h-5" />
              <span className="text-gray-700 font-medium">{currentFileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleView}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors flex items-center gap-1"
                disabled={uploading}
              >
                <Eye className="w-4 h-4" /> View
              </button>
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                disabled={uploading}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dropzone Area - Only show if no file is currently uploaded */}
      {!currentFileName && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-[#FFB255] bg-orange-50' : 'border-gray-300 hover:border-[#FFB255]'}`}
        >
          <input {...getInputProps()} />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-[#FFB255]' : 'text-gray-400'}`} />
          {isDragActive ? (
            <p className="text-[#FFB255] font-medium">Drop the PDF file here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">Drag and drop your PDF file here, or click to select</p>
              <p className="text-yellow-600 mb-2">
                (Upload only one pdf which covers all the assignment(s)/Quiz(s) etc. and solutions)
              </p>
              <p className="text-gray-400 text-sm">Maximum file size: 50MB</p>
            </div>
          )}
        </div>
      )}

      {/* File Selection Display */}
      {file && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-[#FFB255] w-5 h-5" />
              <span className="text-gray-700 font-medium">{file.name}</span>
              <span className="text-gray-400 text-sm">
                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-[#FFB255] hover:bg-[#f5a543] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {uploading ? 'Uploading...' : 'Upload'}
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2 text-green-600">
          <Check className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {/* PDF Viewer */}
      {isViewing && viewUrl && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-800">PDF Preview</h3>
            <button 
              onClick={() => setIsViewing(false)} 
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div className="border rounded overflow-hidden" style={{ height: '600px' }}>
            <iframe
              src={viewUrl}
              width="100%"
              height="100%"
              title="PDF Preview"
              className="border-0"
              style={{ border: 'none' }}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;