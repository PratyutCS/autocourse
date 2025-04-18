import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiFillDelete } from "react-icons/ai";
import { IoMdDownload } from "react-icons/io";
import { FcDocument } from "react-icons/fc";
import { IoCheckmarkCircle, IoClose, IoWarning, IoEye, IoEllipsisVertical } from "react-icons/io5";
import { MdContentCopy } from "react-icons/md";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import constants from "../constants";

export default function NewC(props) {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ visible: false, type: '', message: '' });
  const [isHovered, setIsHovered] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const notificationTimerRef = useRef(null);
  
  const form = (num, userData) => {
    navigate('/form', { state: { num: num, userData: userData } });
  }

  const Clone = async (num) => {
    const token = localStorage.getItem('token');
    try {
      showNotification('loading', 'Cloning document...');
      const response = await axios.post(constants.url + '/clone', { num }, { 
        headers: { 
          'x-auth-token': token, 
          'ngrok-skip-browser-warning': '69420' 
        } 
      });
      
      if (response.status === 200) {
        showNotification('success', 'Document cloned successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error cloning document:", error);
      showNotification('error', 'Failed to clone document. Please try again.');
    }
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

  const showNotification = (type, message, duration = 3000) => {
    // Clear any existing timeout to prevent conflicts
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }
    
    setNotification({ visible: true, type, message });
    
    // Only set auto-hide timeout for non-loading notifications or if specified
    if (type !== 'loading' || duration > 0) {
      notificationTimerRef.current = setTimeout(() => {
        setNotification(prev => ({ ...prev, visible: false }));
      }, duration);
    }
  }

  const hideNotification = () => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }
    setNotification(prev => ({ ...prev, visible: false }));
  }

  const Download = async (num) => {
    const token = localStorage.getItem('token');
    
    // Prevent multiple downloads
    if (isDownloading) return;
    
    setIsDownloading(true);
    showNotification('loading', 'Preparing your download...', 0); // 0 means don't auto-hide
    
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
        
        // Create a promise that resolves when the download starts
        const downloadStarted = new Promise((resolve) => {
          link.onload = resolve;
          link.onclick = resolve;
        });
        
        link.click();
        
        // Wait for download to start before showing success
        await downloadStarted;
        
        // Clean up the link element
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
        
        // Show success notification after a small delay to ensure the download UI is visible
        showNotification('success', 'File downloaded successfully!');
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      showNotification('error', 'Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }

  const Preview = async (num) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('error', 'You need to be logged in. Please log in again.');
      return;
    }
    
    if (props.done !== 1) {
      showNotification('error', 'Cannot preview incomplete documents');
      return;
    }
    
    const previewTab = window.open('', '_blank');
    if (!previewTab) {
      showNotification('error', 'Popup blocked! Please disable your popup blocker.');
      return;
    }
    
    setIsLoadingPreview(true);
    showNotification('loading', 'Generating PDF for preview...', 0);
    
    try {
      const response = await axios.post(constants.url + '/download', { num }, { 
        headers: { 
          'x-auth-token': token, 
          'ngrok-skip-browser-warning': '69420' 
        }, 
        responseType: 'blob' 
      });
      
      if (response.status === 200) {
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(pdfBlob);
        previewTab.location.href = url;
        showNotification('success', 'Preview opened in a new tab!');
      }
    } catch (error) {
      console.error("Error previewing file:", error);
      if (error.response && error.response.status === 401) {
        showNotification('error', 'Authentication failed. Please log in again.');
      } else {
        showNotification('error', 'Preview failed. Please try again.');
      }
      previewTab.close();
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (!isHovered && isConfirmingDelete) {
      setIsConfirmingDelete(false);
    }
  }, [isHovered, isConfirmingDelete]);

  // Clear notification timer when component unmounts
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        if (isConfirmingDelete) {
          setIsConfirmingDelete(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, isConfirmingDelete]);

  const Notification = () => {
    if (!notification.visible) return null;
    
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

  const getBorderColorClass = () => {
    if (props.done === 1) {
      return isHovered ? 'border-green-500' : 'border-green-300';
    }
    return isHovered ? 'border-red-500' : 'border-red-300';
  };

  return (
    <>
      <AnimatePresence>
        {notification.visible && <Notification />}
      </AnimatePresence>
      <motion.div 
        className={`relative h-full w-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-2 ${getBorderColorClass()}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          // Don't auto-close menu when mouse leaves the card
        }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {/* Status Badge */}
          {props.done === 1 ? (
            <div className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              <IoCheckmarkCircle className="w-3.5 h-3.5" />
              <span>Data Extracted</span>
            </div>
          ) : (
            <div className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              <IoWarning className="w-3.5 h-3.5" />
              <span>Data is being extracted</span>
            </div>
          )}
          
          {/* Three-dot menu */}
          <div className="relative" ref={menuRef}>
            <button 
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
                if (isConfirmingDelete) setIsConfirmingDelete(false);
              }}
              aria-label="More options"
            >
              <IoEllipsisVertical className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Dropdown menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div 
                  className="absolute right-0 top-full mt-1 w-44 bg-white rounded-md shadow-lg z-50 border border-gray-200 py-1 overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <button 
                    onClick={() => {
                      Clone(props.num);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <MdContentCopy className="w-4 h-4" />
                    <span>Clone</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      Download(props.num);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <IoMdDownload className="w-4 h-4" />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => {
                      Delete(props.num);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${
                      isConfirmingDelete 
                        ? "bg-red-50 text-red-600"
                        : "hover:bg-red-50 text-gray-700 hover:text-red-600"
                    }`}
                  >
                    <AiFillDelete className="w-4 h-4" />
                    <span>{isConfirmingDelete ? "Confirm Delete" : "Delete"}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="flex h-full flex-col items-center justify-between p-6">
          <div className="w-full flex flex-col items-center gap-4">
            <div className={`rounded-full p-4 transition-colors duration-300 shadow-sm ${props.done === 1 ? 'bg-green-50' : 'bg-red-50'}`}>
              <FcDocument className="w-10 h-10" />
            </div>
            <div className="w-full text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-1 truncate px-2" title={props.name}>
                {props.name}
              </h3>
              <p className="text-xs text-gray-500">
                Last modified: {props.last_modified}
              </p>
            </div>
          </div>
          
          <div className="w-full flex flex-col gap-3 mt-6">
            <button 
              onClick={() => form(props.num, props.userData)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFB255] hover:bg-[#ffa133] text-white rounded-md transition-all duration-200 font-medium shadow-sm hover:shadow"
            >
              <IoEye className="w-4 h-4" />
              <span>Edit Document</span>
            </button>
            
            <button 
              onClick={() => Preview(props.num)}
              disabled={props.done !== 1 || isLoadingPreview}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 font-medium shadow-sm ${
                props.done !== 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:shadow'
              } `}
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
          </div>
        </div>
        
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