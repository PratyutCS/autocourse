import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, FileText, Eye, Trash2, AlertTriangle } from 'lucide-react';

const PDFUploader = (props) => {
  const [pdfs, setPdfs] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    console.log("aqis is : ", props.aqis);
  }, [props.aqis]);

  const uploadPDF = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('http://localhost:3000/upload-pdf', {
        method: 'POST',
        headers: {
          "x-auth-token": localStorage.getItem("token"),
          "num" : props.num
        },
        body: formData,
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('File uploaded successfully:', data);
        alert('PDF uploaded successfully');
      } else {
        console.error('Upload failed:', data.message);
        setError(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error uploading file');
    }
  };
  
  const onDrop = useCallback((acceptedFiles) => {
    setError(null);
    const file = acceptedFiles[0];
    if (file) {
      uploadPDF(file);
      setPdfs((prevPdfs) => [
        ...prevPdfs,
        {
          ...file,
          preview: URL.createObjectURL(file),
          id: `${file.name}-${Date.now()}`,
        },
      ]);
    }
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
    URL.revokeObjectURL(pdfs.find(pdf => pdf.id === fileId)?.preview);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div 
        {...getRootProps()} 
        className={`
          p-6 text-center cursor-pointer transition-all duration-300 
          border-2 border-dashed group
          ${isDragActive 
            ? 'border-[#FFB255] bg-[#FFB255]/5' 
            : 'border-gray-300 hover:border-[#FFB255]'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <FileUp 
            className={`
              w-12 h-12 mb-4 
              ${isDragActive 
                ? 'text-[#FFB255] scale-110' 
                : 'text-gray-400 group-hover:text-[#FFB255]'}
              transition-all duration-300
            `}
          />
          <p className="text-sm text-gray-600 mb-2">
            {isDragActive 
              ? 'Drop the PDF file here' 
              : 'Drag and drop a PDF file, or click to select'}
          </p>
          <p className="text-xs text-gray-500">
            Maximum file size: 50MB | PDF only
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center p-4 bg-red-50 text-red-700 space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {pdfs.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Uploaded Files
          </h3>
          <div className="space-y-3">
            {pdfs.map((file) => (
              <div 
                key={file.id} 
                className="
                  flex items-center justify-between 
                  p-3 bg-white rounded-lg 
                  border border-gray-200 
                  shadow-sm hover:shadow-md 
                  transition-shadow duration-300
                "
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-[#FFB255]" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(file.preview, '_blank')}
                    className="
                      p-2 rounded-full 
                      hover:bg-blue-50 
                      text-blue-600 
                      hover:text-blue-800
                      transition-colors
                    "
                    title="View PDF"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="
                      p-2 rounded-full 
                      hover:bg-red-50 
                      text-red-600 
                      hover:text-red-800
                      transition-colors
                    "
                    title="Remove PDF"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;