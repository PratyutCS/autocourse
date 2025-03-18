import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Trash2, Upload, FileText, AlertCircle, Check } from 'lucide-react';
import constants from "../constants";

const PDFUploader = ({ num, onUploadSuccess, onDeleteSuccess, initialFileName }) => {
  // console.log("INIFILENAME: "+initialFileName);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentFileName, setCurrentFileName] = useState(initialFileName || '');

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
      
      const response = await axios.post(constants.url + '/upload-pdf', formData, {
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

      await axios.post(constants.url + '/merge-delete', {}, {
        headers: {
          'num': num,
          'x-auth-token': localStorage.getItem('token'),
          'ngrok-skip-browser-warning': '69420'
        }
      });

      setSuccess('File deleted successfully!');
      setCurrentFileName('');
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting file');
    } finally {
      setUploading(false);
    }
  };

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
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
              disabled={uploading}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Dropzone Area */}
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
            <p className="text-yellow-600 mb-2 ">(Upload only one pdf which covers all the assignment (s)/Quiz(s) etc. and solutions)</p>
            <p className="text-gray-400 text-sm">Maximum file size: 50MB</p>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default PDFUploader;