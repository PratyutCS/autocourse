import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiFillDelete } from "react-icons/ai";
import { IoMdDownload } from "react-icons/io";
import { FcDocument } from "react-icons/fc";
import { IoCheckmarkCircle, IoClose, IoWarning, IoEye } from "react-icons/io5";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import constants from "../constants";

export default function NewC(props) {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ visible: false, type: '', message: '' });
  const [isHovered, setIsHovered] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const pdfModalRef = useRef(null);

  // Close modal when clicking outside
  // Clean up blob URLs when component unmounts
useEffect(() => {
  return () => {
    if (pdfUrl && pdfUrl.startsWith('blob:')) {
      URL.revokeObjectURL(pdfUrl);
    }
  };
}, [pdfUrl]);
  // Close modal when clicking outside
useEffect(() => {
  function handleClickOutside(event) {
    if (pdfModalRef.current && !pdfModalRef.current.contains(event.target)) {
      // Revoke the object URL to prevent memory leaks
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(null);
      setShowPreview(false);
    }
  }

  if (showPreview) {
    document.addEventListener("mousedown", handleClickOutside);
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [showPreview, pdfUrl]);

  const form = (num, userData) => {
    navigate('/form', { state: { num: num, userData: userData } });
  }

  const Delete = async (num) => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    const token = localStorage.getItem('token');
    try {
      showNotification('loading', 'Deleting document...');
      const response = await axios.post(constants.url + '/delete', { num }, {
        headers: {
          'x-auth-token': token,
          'ngrok-skip-browser-warning': '69420'
        }
      });
      if (response.status === 200) {
        showNotification('success', 'Document deleted successfully!');
        // Refresh with a slight delay to show the notification
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      showNotification('error', 'Failed to delete document. Please try again.');
      setIsConfirmingDelete(false);
    }
  }

  const showNotification = (type, message) => {
    setNotification({ visible: true, type, message });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  }

  const Download = async (num) => {
    const token = localStorage.getItem('token');
    
    // Show download start notification
    showNotification('loading', 'Preparing your download...');
    
    try {
      const response = await axios.post(constants.url + '/download', { num }, {
        headers: {
          'x-auth-token': token,
          'ngrok-skip-browser-warning': '69420'
        },
        responseType: 'blob'
      });
  
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${props.name || 'document'}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        
        // Show success notification
        showNotification('success', 'File downloaded successfully!');
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      // Show error notification
      showNotification('error', 'Download failed. Please try again.');
    }
  }

  // NEW: Preview function that triggers PDF generation for viewing
  const Preview = async (num) => {
    const token = localStorage.getItem('token');
    
    // Check if token exists
    if (!token) {
      showNotification('error', 'You need to be logged in. Please log in again.');
      return;
    }
    
    // Don't show preview for incomplete documents
    if (props.done !== 1) {
      showNotification('error', 'Cannot preview incomplete documents');
      return;
    }
  
    setIsLoadingPreview(true);
    showNotification('loading', 'Generating PDF for preview...');
    
    try {
      // First, generate the PDF
      const response = await axios.post(constants.url + '/download', { num }, {
        headers: {
          'x-auth-token': token,
          'ngrok-skip-browser-warning': '69420'
        },
        responseType: 'blob'
      });
  
      if (response.status === 200) {
        // Create a blob URL from the PDF data
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(pdfBlob);
        
        // Set the URL and show the modal
        setPdfUrl(url);
        setShowPreview(true);
        showNotification('success', 'Preview ready!');
      }
    } catch (error) {
      console.error("Error previewing file:", error);
      if (error.response && error.response.status === 401) {
        showNotification('error', 'Authentication failed. Please log in again.');
      } else {
        showNotification('error', 'Preview failed. Please try again.');
      }
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Reset confirm state when mouse leaves
  useEffect(() => {
    if (!isHovered && isConfirmingDelete) {
      setIsConfirmingDelete(false);
    }
  }, [isHovered, isConfirmingDelete]);

  // Notification component with animation
  const Notification = () => {
    if (!notification.visible) return null;
    
    // Determine icon and color based on notification type
    let icon;
    let bgColor;
    let textColor = "text-white";
    
    switch(notification.type) {
      case 'success':
        icon = <IoCheckmarkCircle className="w-5 h-5" />;
        bgColor = "bg-green-500";
        break;
      case 'error':
        icon = <IoWarning className="w-5 h-5" />;
        bgColor = "bg-red-500";
        break;
      case 'loading':
        icon = (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        );
        bgColor = "bg-[#FFB255]";
        break;
      default:
        icon = <IoCheckmarkCircle className="w-5 h-5" />;
        bgColor = "bg-[#FFB255]";
    }
    
    return (
      <motion.div 
        className="fixed top-6 right-6 z-50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
      >
        <div className={`${bgColor} ${textColor} flex items-center gap-3 py-3 px-4 rounded-lg shadow-lg max-w-xs`}>
          <div className="flex-shrink-0">
            {icon}
          </div>
          <p className="text-sm font-medium">{notification.message}</p>
          <button 
            onClick={hideNotification}
            className="ml-auto text-white/80 hover:text-white transition-colors"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Get highlight border color based on completion status
  const getBorderColorClass = () => {
    if (props.done === 1) {
      return isHovered ? 'border-green-500' : 'border-green-300';
    }
    return isHovered ? 'border-red-500' : 'border-red-300';
  };

  // PDF Preview Modal
  const PDFPreviewModal = () => {
    if (!showPreview) return null;
  
    // Function to handle closing the preview and cleaning up the URL
    const handleClosePreview = () => {
      if (pdfUrl) {
        // Revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(null);
      setShowPreview(false);
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <motion.div 
          ref={pdfModalRef}
          className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              Document Preview: {props.name}
            </h3>
            <button 
              onClick={handleClosePreview}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <IoClose className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 w-full h-full bg-gray-100">
            {pdfUrl ? (
              <object 
                data={pdfUrl}
                type="application/pdf"
                className="w-full h-full"
              >
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-600">
                    It appears your browser doesn't support embedded PDFs. 
                    <a 
                      href={pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 ml-1 underline"
                    >
                      Click here to view the PDF.
                    </a>
                  </p>
                </div>
              </object>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[#FFB255] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading preview...</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };
  return (
    <>
      <AnimatePresence>
        {notification.visible && <Notification />}
        <PDFPreviewModal />
      </AnimatePresence>
      
      <motion.div 
        className={`relative h-full w-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-2 ${getBorderColorClass()}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Status badge */}
        <div className="absolute top-3 right-3 z-10">
          {props.done === 1 ? (
            <div className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              <IoCheckmarkCircle className="w-3.5 h-3.5" />
              <span>Complete</span>
            </div>
          ) : (
            <div className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              <IoWarning className="w-3.5 h-3.5" />
              <span>Incomplete</span>
            </div>
          )}
        </div>

        <div className="flex h-full flex-col items-center justify-between p-6">
          {/* Document icon and title */}
          <div className="w-full flex flex-col items-center gap-4">
            <div className={`rounded-full p-4 transition-colors duration-300 shadow-sm ${props.done === 1 ? 'bg-green-50' : 'bg-red-50'}`}>
              <FcDocument className="w-10 h-10" />
            </div>
            
            <div className="w-full text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-1 truncate px-2" title={props.name}>
                {props.name}
              </h3>
              <p className="text-xs text-gray-500">
                Last modified: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full flex flex-col gap-3 mt-6">
            {/* View document button */}
            <button
              onClick={() => form(props.num, props.userData)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFB255] hover:bg-[#ffa133] text-white rounded-md transition-all duration-200 font-medium shadow-sm hover:shadow"
            >
              <IoEye className="w-4 h-4" />
              <span>View Document</span>
            </button>
            
            {/* Preview PDF button - NEW */}
            <button
              onClick={() => Preview(props.num)}
              disabled={props.done !== 1 || isLoadingPreview}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 font-medium shadow-sm
                ${props.done !== 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:shadow'}
              `}
            >
              {isLoadingPreview ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Preview PDF</span>
                </>
              )}
            </button>
            
            <div className="flex justify-between gap-2">
              {/* Delete button */}
              <button
                onClick={() => Delete(props.num)}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 border font-medium ${
                  isConfirmingDelete
                    ? "bg-red-500 text-white hover:bg-red-600 border-red-500"
                    : "bg-white hover:bg-red-50 text-red-500 border-red-200 hover:border-red-300"
                }`}
                title={isConfirmingDelete ? "Confirm delete" : "Delete"}
              >
                <AiFillDelete className="w-4 h-4" />
                {isConfirmingDelete && <span className="text-xs">Confirm</span>}
              </button>
              
              {/* Download button */}
              <button
                onClick={() => Download(props.num)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-500 rounded-md transition-all duration-200 border border-blue-200 hover:border-blue-300 font-medium"
                title="Download"
              >
                <IoMdDownload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Subtle hover effect overlay */}
        <motion.div 
          className="absolute inset-0 bg-gray-900 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.03 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </>
  );
}