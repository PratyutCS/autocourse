import { useEffect, useState, useRef } from "react";
import { TfiPowerOff } from "react-icons/tfi";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { HiMenuAlt3 } from "react-icons/hi";
import { AiOutlineFilePdf } from "react-icons/ai";
import { IoMdDownload } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import constants from "../constants";

const AsideComp = ({ isCollapsed, setIsCollapsed, files, onFileSelect, activeSection }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isInfoPage = location.pathname.includes('/form');

  // Support form URL
  const supportFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSd1UrHTCGcP7GFV6W8LKzV3Moplsf3x9sPnX2dBcPwk7KuljA/viewform?usp=sharing";

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await axios.get(constants.url + "/", {
          headers: { "x-auth-token": token },
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Click outside to close menu handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Function to navigate to the form edit page
  const navigateToFormEdit = (index) => {
    // If onFileSelect is provided, call it
    if (onFileSelect) {
      onFileSelect(index);
    }
    
    // Navigate to form page with the file index and user data
    navigate('/form', { state: { num: index, userData: userData } });
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        constants.url + "/api/signout", 
        {}, 
        { headers: { "x-auth-token": token } }
      );
      if (response.status !== 500) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleFileDelete = async (num) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(constants.url + '/delete', { num }, {
        headers: { 'x-auth-token': token }
      });
      if (response.status === 200) window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
    }
    setMenuOpenIndex(null);
  };

  const handleFileDownload = async (num) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(constants.url + '/download', { num }, {
        headers: { 'x-auth-token': token },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'file.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
    }
    setMenuOpenIndex(null);
  };

  const handleOpenSupportForm = () => {
    window.open(supportFormUrl, '_blank');
  };

  const getUserInitials = (name) => {
    if (!name) return "US";
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Filter files based on search query
  const filteredFiles = files?.filter(file => 
    (file.course_name?.toLowerCase() || file.filename?.toLowerCase() || '')
    .includes(fileSearchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <aside className="w-[20vw] h-full bg-black border-r border-zinc-800 flex items-center justify-center relative">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </aside>
    );
  }

  return (
    <aside 
      className={`relative flex flex-col h-full transition-all duration-300 ease-in-out 
      ${isCollapsed ? "w-[4.5vw]" : "w-[20vw]"} 
      bg-zinc-900 border-r border-zinc-800 shadow-sm`}
    >
      {/* Collapse Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-zinc-800 rounded-full p-1.5 hover:bg-amber-500 transition-all duration-300 shadow-md hover:shadow-amber-900/30 z-10 border border-zinc-700"
      >
        <HiMenuAlt3 
          size={18} 
          className={`text-zinc-300 transform transition-transform ${isCollapsed ? "rotate-180" : ""}`} 
        />
      </button>

      {/* Logo Section */}
      <div className="flex-shrink-0 flex items-center h-[12%] px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3 w-full">
          <img 
            src="/customer-logo.png" 
            alt="BMU Logo" 
            className="h-[5vh] w-auto transition-all duration-300" 
          />
          <h1 
            className={`font-['Nunito'] font-semibold text-zinc-100 text-[1.8vmin] transition-opacity duration-300 truncate
            ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-full"}`}
          >
            BML Munjal University
          </h1>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3 group">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-500 text-zinc-900 font-semibold text-sm shrink-0">
            {getUserInitials(userData?.name)}
          </div>
          <div 
            className={`flex flex-col transition-opacity duration-300 overflow-hidden 
            ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-full"}`}
          >
            <span className="text-zinc-100 font-medium text-sm truncate">
              {userData?.name || "User Name"}
            </span>
            <span className="text-zinc-400 text-xs font-light truncate">
              {userData?.email || "user@email.com"}
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow flex flex-col px-3 pt-4 overflow-hidden">
        {/* Dashboard Files or Form Content */}
        <div className="flex-grow overflow-y-auto mb-4 custom-scrollbar">
          {!isInfoPage ? (
            // Files Section for Dashboard
            <div className="space-y-4">
              <div className={`transition-opacity ${isCollapsed ? "opacity-0 hidden" : "opacity-100"}`}>
                <h3 className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-3 px-2">
                  Recent Documents
                </h3>
                
                {/* Search Input for Files */}
                <div className="relative px-2 mb-4">
                  <input 
                    type="text" 
                    placeholder="Search files..." 
                    value={fileSearchQuery} 
                    onChange={(e) => setFileSearchQuery(e.target.value)} 
                    className="w-full bg-zinc-800 text-zinc-200 text-sm rounded-lg pl-8 pr-3 py-2 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 text-sm" />
                </div>
              </div>

              {/* Files List */}
              <div className="space-y-1 px-2">
                {filteredFiles && filteredFiles.length > 0 ? (
                  filteredFiles.map((file, index) => (
                    <div 
                      key={index} 
                      className="group relative flex items-center py-3 px-3 rounded-lg hover:bg-zinc-800 transition-all cursor-pointer"
                      onClick={() => navigateToFormEdit(index)}
                    >
                      {isCollapsed ? (
                        <div className="flex-grow flex justify-center">
                          <AiOutlineFilePdf className="text-amber-500 text-xl" />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center flex-grow overflow-hidden">
                            <div className="bg-zinc-800 p-2 rounded-lg mr-3">
                              <AiOutlineFilePdf className="text-amber-500 text-lg" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-zinc-200 text-sm font-medium truncate">
                                {file.course_name || file.filename}
                              </span>
                              <span className="text-xs text-zinc-500 mt-0.5">
                                PDF Document
                              </span>
                            </div>
                          </div>
                          {/* Three Dots Menu */}
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenIndex(menuOpenIndex === index ? null : index);
                              }}
                              className="p-1.5 hover:bg-zinc-700 rounded-full transition-colors"
                            >
                              <BsThreeDotsVertical className="text-zinc-400 text-lg" />
                            </button>
                            
                            {/* Dropdown Menu */}
                            {menuOpenIndex === index && (
                              <div 
                                ref={menuRef}
                                className="absolute right-0 top-8 bg-zinc-800 shadow-lg rounded-lg py-1 w-36 z-10 border border-zinc-700"
                              >
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileDownload(index);
                                  }}
                                  className="flex items-center w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
                                >
                                  <IoMdDownload className="mr-2 text-amber-500" />
                                  Download
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileDelete(index);
                                  }}
                                  className="flex items-center w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
                                >
                                  <AiFillDelete className="mr-2 text-red-500" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={`text-center py-8 ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
                    <p className="text-zinc-500 text-sm mb-2">No files found</p>
                    <p className="text-zinc-600 text-xs px-4">
                      {fileSearchQuery 
                        ? "Try a different search term" 
                        : "Upload files to get started"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // For Form Page - Simplified Navigation with Key Statistics instead of Index
            <div className={`space-y-4 ${isCollapsed ? "px-0" : "px-2"}`}>
              {/* Instead of form index, show some key statistics/info about the form */}
              {!isCollapsed && (
                <>
                  <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                    <h3 className="text-amber-400 text-sm font-medium mb-2">Current Form</h3>
                    <p className="text-zinc-400 text-xs mb-3">Course Handout Form</p>
                    <div className="flex items-center">
                      <div className="h-1.5 bg-zinc-700 rounded-full w-full mr-2">
                        <div className="h-1.5 rounded-full bg-amber-500" style={{ width: "65%" }}></div>
                      </div>
                      <span className="text-xs text-amber-400 font-medium">65%</span>
                    </div>
                  </div>
                  
                  {/* Quick Access Buttons */}
                  <div className="pt-2">
                    <h3 className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-3">
                      Quick Access
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex flex-col items-center justify-center p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-all">
                        <div className="mb-2 bg-zinc-700 p-2 rounded-full">
                          <AiOutlineFilePdf className="text-amber-500 text-lg" />
                        </div>
                        <span className="text-zinc-300 text-xs font-medium">PDF Export</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-all">
                        <div className="mb-2 bg-zinc-700 p-2 rounded-full">
                          <IoMdDownload className="text-amber-500 text-lg" />
                        </div>
                        <span className="text-zinc-300 text-xs font-medium">Save Draft</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Form Status Information */}
                  <div className="pt-2">
                    <h3 className="text-zinc-500 text-xs font-medium uppercase tracking-wide mb-3">
                      Form Status
                    </h3>
                    <div className="bg-zinc-800 p-3 rounded-lg border border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500">Last edited</span>
                        <span className="text-xs font-medium text-zinc-300">Today, 2:30 PM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">Status</span>
                        <span className="text-xs font-medium text-amber-500 bg-zinc-700 px-2 py-0.5 rounded">In Progress</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* For collapsed sidebar, show minimal icons */}
              {isCollapsed && (
                <div className="flex flex-col items-center space-y-4 pt-2">
                  <div className="bg-zinc-800 p-2 rounded-full" title="Form Progress">
                    <div className="h-6 w-6 rounded-full border-2 border-amber-500 flex items-center justify-center">
                      <span className="text-xs font-medium text-amber-400">65%</span>
                    </div>
                  </div>
                  <button className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-all" title="PDF Export">
                    <AiOutlineFilePdf className="text-amber-500 text-lg" />
                  </button>
                  <button className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-all" title="Save Draft">
                    <IoMdDownload className="text-amber-500 text-lg" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex-shrink-0 border-t border-zinc-800 py-3 px-2">
        <div className="flex items-center justify-around">
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center p-2 rounded-lg hover:bg-zinc-800 transition-all"
            title="Logout"
          >
            <TfiPowerOff className="text-zinc-400 text-lg mb-1" />
            {!isCollapsed && (
              <span className="text-xs text-zinc-300">Logout</span>
            )}
          </button>
          
          <button 
            onClick={handleOpenSupportForm}
            className="flex flex-col items-center p-2 rounded-lg hover:bg-zinc-800 transition-all group"
            title="Get Help & Support"
          >
            <RxQuestionMarkCircled className="text-zinc-400 group-hover:text-amber-500 text-lg mb-1 transition-colors" />
            {!isCollapsed && (
              <span className="text-xs text-zinc-300 group-hover:text-amber-500 transition-colors">Support</span>
            )}
          </button>
        </div>
      </div>
      
      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3F3F46;
          border-radius: 20px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #52525B;
        }
      `}</style>
    </aside>
  );
};

AsideComp.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  setIsCollapsed: PropTypes.func.isRequired,
  files: PropTypes.array,
  onFileSelect: PropTypes.func,
  activeSection: PropTypes.string,
};

export default AsideComp;