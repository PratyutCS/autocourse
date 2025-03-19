import { useEffect, useState } from "react";
import { TfiPowerOff } from "react-icons/tfi";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { HiMenuAlt3 } from "react-icons/hi";
import { FaRegFilePdf } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { IoMdDownload } from "react-icons/io";
import constants from "../constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const AsideComp = ({ userEmail, isCollapsed, setIsCollapsed, files }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredFileId, setHoveredFileId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userEmail) {
      setIsLoading(false);
    }
  }, [userEmail]);

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        constants.url + "/api/signout",
        {},
        {
          headers: {
            "x-auth-token": token,
            "ngrok-skip-browser-warning": "69420"
          }
        }
      );

      if (response.status !== 500) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleDelete = async (fileId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        constants.url + "/delete",
        { id: fileId },
        {
          headers: {
            "x-auth-token": token,
            "ngrok-skip-browser-warning": "69420"
          }
        }
      );
      window.location.reload();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleDownload = async (fileId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        constants.url + "/download",
        { id: fileId },
        {
          headers: {
            "x-auth-token": token,
            "ngrok-skip-browser-warning": "69420"
          },
          responseType: 'blob'
        }
      );

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: response.data.type }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'file.pdf');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  if (isLoading) {
    return (
      <aside className="w-[20vw] h-full bg-[#323439] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-300"></div>
      </aside>
    );
  }

  return (
    <aside
      className={`relative flex flex-col bg-[#323439] h-full shadow-lg transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[4vw]" : "w-[20vw]"
      }`}
    >
      {/* Collapsible button with improved styling */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-[-12px] top-6 bg-[#323439] rounded-full p-1.5 hover:bg-[#3a3c42] transition-colors z-10 shadow-md"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <HiMenuAlt3
          size={20}
          className={`text-gray-300 transform transition-transform duration-300 ${
            isCollapsed ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Header with logo */}
      <div className="flex items-center h-[20%] gap-4 px-5 py-6 border-b border-gray-700/30">
        <img
          src="/customer-logo.png"
          alt="BMU Logo"
          className="h-[7vh] w-auto"
        />
        <h1
          className={`font-['Nunito'] font-light text-[#c3c3c3] text-[2vmin] transition-opacity duration-300 ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          }`}
        >
          Bml Munjal University
        </h1>
      </div>

      {/* Files section with improved styling */}
      <div className="flex-1 overflow-auto py-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <h2 className={`text-gray-400 font-medium px-5 py-2 text-sm uppercase tracking-wider ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
          Your Files
        </h2>
        {files && files.length > 0 ? (
          files.map((file, index) => (
            <div 
              key={index} 
              className="mx-2 my-1 rounded-md hover:bg-[#3a3c42] transition-all duration-200"
              onMouseEnter={() => setHoveredFileId(file.id)}
              onMouseLeave={() => setHoveredFileId(null)}
            >
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex-shrink-0 bg-[#42444a] p-2 rounded-md">
                    <FaRegFilePdf className="text-[#e74c3c]" size={isCollapsed ? 16 : 20} />
                  </div>
                  <span className={`text-gray-300 font-light truncate transition-opacity duration-300 ${
                    isCollapsed ? "opacity-0 w-0" : "opacity-100"
                  }`}>
                    {file.course_name || file.course_code || file.filename || "Unknown Course"}
                  </span>
                </div>
                <div className={`flex gap-2 transition-opacity duration-300 ${
                  isCollapsed ? "opacity-0 w-0" : "opacity-100"
                }`}>
                  <button
                    onClick={(e) => handleDownload(file.id, e)}
                    className="p-1.5 rounded-full hover:bg-[#42444a] transition-colors group"
                    aria-label="Download file"
                    title="Download"
                  >
                    <IoMdDownload 
                      size={20} 
                      className={`${hoveredFileId === file.id ? 'text-emerald-400' : 'text-emerald-600'} 
                                  group-hover:text-emerald-400 transition-colors`} 
                    />
                  </button>
                  <button
                    onClick={(e) => handleDelete(file.id, e)}
                    className="p-1.5 rounded-full hover:bg-[#42444a] transition-colors group"
                    aria-label="Delete file"
                    title="Delete"
                  >
                    <AiFillDelete 
                      size={20} 
                      className={`${hoveredFileId === file.id ? 'text-rose-400' : 'text-rose-600'} 
                                  group-hover:text-rose-400 transition-colors`} 
                    />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="bg-[#42444a] p-3 rounded-full mb-3">
              <FaRegFilePdf className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-400 text-center text-sm">No files available.</p>
            <p className={`text-gray-500 text-center text-xs mt-1 ${isCollapsed ? "hidden" : "block"}`}>
              Upload files to see them here.
            </p>
          </div>
        )}
      </div>

      {/* Footer with support and logout */}
      <div className="mt-auto border-t border-gray-700/30 p-4 space-y-3">
        <button
          type="button"
          className="flex items-center gap-4 w-full px-2 py-2 rounded-md hover:bg-[#3a3c42] transition-colors"
          aria-label="Get support"
        >
          <div className="flex-shrink-0 bg-[#42444a] p-2 rounded-full">
            <RxQuestionMarkCircled size={20} className="text-gray-300" />
          </div>
          <span
            className={`text-gray-300 font-light transition-opacity duration-300 ${
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            }`}
          >
            Support
          </span>
        </button>

        <form onSubmit={handleLogout} className="w-full">
          <button
            type="submit"
            className="flex items-center gap-4 w-full px-2 py-2 rounded-md hover:bg-[#3a3c42] transition-colors"
            aria-label="Logout"
          >
            <div className="flex-shrink-0 bg-[#42444a] p-2 rounded-full">
              <TfiPowerOff size={20} className="text-[#e74c3c]" />
            </div>
            <div
              className={`flex flex-col items-start transition-opacity duration-300 ${
                isCollapsed ? "opacity-0 w-0" : "opacity-100"
              }`}
            >
              <span className="text-gray-300 font-light">Logout</span>
              {userEmail && (
                <p className="font-light text-[#E4F3FF] opacity-[0.3] text-xs truncate max-w-[150px]">
                  {userEmail}
                </p>
              )}
            </div>
          </button>
        </form>
      </div>
    </aside>
  );
};

AsideComp.propTypes = {
  userEmail: PropTypes.string.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  setIsCollapsed: PropTypes.func.isRequired,
  files: PropTypes.array.isRequired
};

export default AsideComp;