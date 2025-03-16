import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegFilePdf } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { IoMdDownload } from "react-icons/io";
import { FcDocument } from "react-icons/fc";
import { IoCheckmarkCircle, IoClose, IoWarning } from "react-icons/io5";
import axios from 'axios';
import constants from "../constants";

export default function NewC(props) {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ visible: false, type: '', message: '' });

  const form = (num, userData) => {
    navigate('/form', { state: { num: num, userData: userData } });
  }

  const Delete = async (num) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(constants.url + '/delete', { num }, {
        headers: {
          'x-auth-token': token,
          'ngrok-skip-browser-warning': '69420'
        }
      });
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
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
        link.setAttribute('download', 'file.pdf');
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

  // Notification component
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
      <div className="fixed top-6 right-6 z-50 animate-slideIn">
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
      </div>
    );
  }

  // Conditional styling: if done is not equal to 1, add a red border highlight.
  const cardClass = `relative group h-[18rem] w-[16rem] bg-white rounded-lg shadow-sm transition-all duration-300 
    ${props.done !== 1 ? 'border-4 border-red-500' : 'hover:shadow-md border border-gray-200 hover:border-[#FFB255]'}`;

  return (
    <>
      <Notification />
      <div className={cardClass}>
        <div className="flex h-full w-full flex-col items-center justify-between p-6">
          <div className="w-full flex flex-col items-center gap-4">
            <div className="bg-orange-50 rounded-full p-4 group-hover:bg-orange-100 transition-colors duration-300 shadow-sm">
              <FcDocument className="w-10 h-10" />
            </div>
            
            <div className="w-full text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-1 truncate px-2" title={props.name}>
                {props.name}
              </h3>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3 mt-4">
            <button
              onClick={() => form(props.num, props.userData)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFB255] hover:bg-[#ffa133] text-white rounded-md transition-all duration-200 font-medium shadow-sm hover:shadow"
            >
              <FaRegFilePdf className="w-4 h-4" />
              <span>View Document</span>
            </button>
            
            <div className="flex justify-between gap-2">
              <button
                onClick={() => Delete(props.num)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-red-500 rounded-md transition-all duration-200 border border-red-200 hover:border-red-300 font-medium"
                title="Delete"
              >
                <AiFillDelete className="w-4 h-4" />
              </button>
              
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
      </div>
    </>
  );
}