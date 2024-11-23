import React, { useState, useCallback } from 'react';
import { RiCloseFill } from "react-icons/ri";
import { IoCloudUploadOutline } from "react-icons/io5";
import axios from 'axios';
import constants from "../constants";
import ReactDOM from 'react-dom';


const FileUploadPopup = ({ isOpen, onClose }) => {
  const token = localStorage.getItem('token');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await axios.post(constants.url + '/upload', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          'x-auth-token': token
        }
      });
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setFile(null);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 z-50">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-xl mx-4">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl text-gray-900 font-normal">Upload file</h2>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RiCloseFill size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit}>
              {/* Upload Area */}
              <div
                className={`
                  w-full border-2 border-dashed rounded-lg transition-colors duration-200 cursor-pointer
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 bg-white'}
                  ${file ? 'border-green-500 bg-green-50' : ''}
                `}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  id="file-input"
                  className="hidden"
                />
                <label 
                  htmlFor="file-input"
                  className="flex flex-col items-center py-12 cursor-pointer"
                >
                  <IoCloudUploadOutline 
                    className={`w-12 h-12 mb-4 ${file ? 'text-green-500' : 'text-gray-400'}`} 
                  />
                  {file ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-900 font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">Click to choose a different file</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-900">
                        Drag and drop file here, or{' '}
                        <span className="text-blue-600 hover:text-blue-700">browse</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Supports: PDF, DOC, DOCX</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Footer */}
              <div className="flex justify-end mt-8 gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file || isLoading}
                  className={`
                    px-6 py-2 text-sm font-medium rounded-md
                    ${file && !isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                    transition-colors
                  `}
                >
                  {isLoading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
     document.body
  );
};

export default FileUploadPopup;