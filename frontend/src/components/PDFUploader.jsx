import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const PDFUploader = () => {
  const [pdfs, setPdfs] = useState([]);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setError(null);
    setPdfs(acceptedFiles.map((file, index) => ({
      ...file,
      preview: URL.createObjectURL(file),
      id: `${file.name}-${index}`,
    })));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: () => setError('Please only upload PDF files under 50MB'),
  });

  const removeFile = (fileId) => {
    setPdfs(pdfs.filter(pdf => pdf.id !== fileId));
  };

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            `}
          >
            <input {...getInputProps()} />
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm text-gray-600">
              {isDragActive ? 'Drop the PDF file here ...' : 'Drag and drop a PDF file here, or click to select'}
            </p>
            <p className="mt-1 text-xs text-gray-500">Maximum file size: 50MB</p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {pdfs.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center">
                  <span className="text-red-500 text-2xl">📄</span>
                  <span className="ml-3 font-medium">{file.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => window.open(file.preview, '_blank')}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFUploader;