import { useEffect, useState, useRef } from "react";
import { TfiPowerOff } from "react-icons/tfi";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { HiMenuAlt3 } from "react-icons/hi";
import { AiFillDelete } from "react-icons/ai";
import { IoMdDownload } from "react-icons/io";
import { AiOutlineFilePdf } from "react-icons/ai";
import { FiList } from "react-icons/fi";
import { FiSearch } from "react-icons/fi";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import constants from "../constants";

const AsideComp = ({ isCollapsed, setIsCollapsed, files, onFileSelect, activeSection }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [indexSearchQuery, setIndexSearchQuery] = useState("");
  const [stableActiveSection, setStableActiveSection] = useState(activeSection || "header-section");
  const lastActiveSectionRef = useRef(activeSection || "header-section");
  const activeSectionTimeoutRef = useRef(null);
  const ignoreHeaderTimeoutRef = useRef(null);
  const ignoreHeaderUntilRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isInfoPage = location.pathname.includes('/form');

  // Define the index sections for the form
  const formSections = [
    { id: "header-section", title: "Form Header", number: 0 },
    { id: "program-section", title: "Program", number: 1 },
    { id: "course-code-section", title: "Course Code", number: 2 },
    { id: "course-title-section", title: "Course Title", number: 3 },
    { id: "module-section", title: "Module/Semester", number: 4 },
    { id: "session-section", title: "Session", number: 5 },
    { id: "course-description-section", title: "Course Description", number: 6 },
    { id: "copo-mapping-section", title: "CO-PO Mapping", number: 7 },
    { id: "assessments-section", title: "Assessments", number: 8 },
    { id: "student-data-section", title: "Student Data", number: 9 },
    { id: "co-weightage-section", title: "CO Weightage", number: 10 },
    { id: "attainment-criteria-section", title: "Attainment Criteria", number: 11 },
    { id: "assessment-selection-section", title: "Assessment Selection", number: 12 },
    { id: "co-achievement-section", title: "Student CO Achievement", number: 13 },
    { id: "target-attainment-section", title: "Target Attainment", number: 14 },
    { id: "attainment-analysis-section", title: "Attainment Analysis", number: 15 },
    { id: "student-identification-section", title: "Student Identification", number: 16 },
    { id: "course-syllabus-section", title: "Course Syllabus", number: 17 },
    { id: "learning-resources-section", title: "Learning Resources", number: 18 },
    { id: "timetable-section", title: "Weekly Timetable", number: 19 },
    { id: "weak-students-section", title: "Actions for Weak Students", number: 20 },
    { id: "pdf-uploader-section", title: "PDF Uploader", number: 21 },
    { id: "feedback-section", title: "Feedback", number: 22 },
    { id: "faculty-review-section", title: "Faculty Review", number: 23 },
  ];

  // Smart active section handler with protection against quick changes to header
  useEffect(() => {
    // If activeSection is header-section and we're ignoring header section changes,
    // don't update the stableActiveSection
    if (activeSection === "header-section" && ignoreHeaderUntilRef.current) {
      return;
    }
    
    // If section changed
    if (activeSection !== lastActiveSectionRef.current) {
      // Clear any existing timeout
      if (activeSectionTimeoutRef.current) {
        clearTimeout(activeSectionTimeoutRef.current);
      }
      
      // If changing from a non-header section to header section, add a delay
      if (activeSection === "header-section" && lastActiveSectionRef.current !== "header-section") {
        // We'll wait longer before accepting a change to the header section
        activeSectionTimeoutRef.current = setTimeout(() => {
          lastActiveSectionRef.current = activeSection;
          setStableActiveSection(activeSection);
        }, 300); // Longer delay for header changes
      } else {
        // For all other section changes, update more quickly
        lastActiveSectionRef.current = activeSection;
        
        // Brief delay to prevent flickering
        activeSectionTimeoutRef.current = setTimeout(() => {
          setStableActiveSection(activeSection);
        }, 50);
        
        // When we change to a non-header section, prevent changing back to header
        // for a short period (helps with fast scrolling)
        if (activeSection !== "header-section") {
          ignoreHeaderUntilRef.current = true;
          
          if (ignoreHeaderTimeoutRef.current) {
            clearTimeout(ignoreHeaderTimeoutRef.current);
          }
          
          ignoreHeaderTimeoutRef.current = setTimeout(() => {
            ignoreHeaderUntilRef.current = false;
          }, 1000); // Ignore header changes for 1 second
        }
      }
    }
    
    // Clean up timeouts when component unmounts
    return () => {
      if (activeSectionTimeoutRef.current) {
        clearTimeout(activeSectionTimeoutRef.current);
      }
      if (ignoreHeaderTimeoutRef.current) {
        clearTimeout(ignoreHeaderTimeoutRef.current);
      }
    };
  }, [activeSection]);

  // Filter form sections based on search query
  const filteredFormSections = formSections.filter(section => 
    section.title.toLowerCase().includes(indexSearchQuery.toLowerCase())
  );

  // Filter files based on search query
  const filteredFiles = files?.filter(file => 
    (file.course_name?.toLowerCase() || file.filename?.toLowerCase() || '')
    .includes(fileSearchQuery.toLowerCase())
  );

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

  // Reliable scroll handler that avoids issues with fast scrolling
  const scrollToSection = (sectionId) => {
    // Only perform the scroll operation if there's a valid section
    const section = document.getElementById(sectionId);
    if (!section) return;

    // Find the scroll container
    const container = document.querySelector('.space-y-6.overflow-scroll');
    if (container) {
      // Get the absolute position of the section within the container
      const offsetTop = section.offsetTop;
      
      // Scroll with a fixed offset to ensure consistent positioning
      container.scrollTo({
        top: offsetTop - 80,
        behavior: 'smooth'
      });
    } else {
      // Fallback to standard scrollIntoView
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Force-update the active section when manually clicking
    // this bypasses any timing issues
    lastActiveSectionRef.current = sectionId;
    setStableActiveSection(sectionId);
    
    // Also prevent changing to header for a period after manual selection
    ignoreHeaderUntilRef.current = true;
    if (ignoreHeaderTimeoutRef.current) {
      clearTimeout(ignoreHeaderTimeoutRef.current);
    }
    ignoreHeaderTimeoutRef.current = setTimeout(() => {
      ignoreHeaderUntilRef.current = false;
    }, 1500); // Longer protection after manual click
  };

  if (isLoading) {
    return (
      <aside className="w-[20vw] h-full bg-gradient-to-b from-[#2d2e33] to-[#25262a] flex items-center justify-center relative">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFB255]"></div>
      </aside>
    );
  }

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
  };

  const getUserInitials = (name) => {
    if (!name) return "US";
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Function to get the active section name for display
  const getActiveSectionName = () => {
    const activeItem = formSections.find(section => section.id === stableActiveSection);
    return activeItem ? activeItem.title : "Form Header";
  };

  return (
    <aside 
      className={`relative flex flex-col h-full transition-all duration-300 ease-in-out 
      ${isCollapsed ? "w-[4.5vw]" : "w-[20vw]"} 
      bg-gradient-to-b from-[#2d2e33] to-[#25262a] shadow-2xl`}
    >
      {/* Collapse Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-[#3a3b40] rounded-full p-2 hover:bg-[#FFB255] transition-all duration-300 shadow-lg hover:shadow-[#FFB255]/20 z-10"
      >
        <HiMenuAlt3 
          size={20} 
          className={`text-gray-300 transform transition-transform ${isCollapsed ? "rotate-180" : ""}`} 
        />
      </button>

      {/* Logo Section */}
      <div className="flex-shrink-0 flex items-center h-[12%] px-4 py-4 border-b border-[#3a3b40]">
        <div className="flex items-center gap-3 w-full">
          <img 
            src="/customer-logo.png" 
            alt="BMU Logo" 
            className="h-[5vh] w-auto transition-all duration-300" 
          />
          <h1 
            className={`font-['Nunito'] font-semibold text-[#f5f5f5] text-[1.8vmin] transition-opacity duration-300 truncate 
            ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-full"}`}
          >
            BML Munjal University
          </h1>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-[#3a3b40]">
        <div className="flex items-center gap-3 group">
          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-[#FFB255] text-white font-semibold text-sm shrink-0">
            {getUserInitials(userData?.name)}
          </div>
          <div 
            className={`flex flex-col transition-opacity duration-300 overflow-hidden 
            ${isCollapsed ? "opacity-0 w-0" : "opacity-100 w-full"}`}
          >
            <span className="text-[#f5f5f5] font-medium text-sm truncate">
              {userData?.name || "User Name"}
            </span>
            <span className="text-[#909096] text-xs font-light truncate">
              {userData?.email || "user@email.com"}
            </span>
          </div>
        </div>
      </div>

      {/* Active Section Indicator - with fixed height to prevent layout shifts */}
      {!isCollapsed && isInfoPage && (
        <div className="bg-[#FFB255] bg-opacity-10 px-4 py-2 border-b border-[#3a3b40] h-[36px] flex items-center">
          <div className="w-2 h-2 rounded-full bg-[#FFB255] mr-2 flex-shrink-0"></div>
          <span className="text-[#FFB255] text-xs font-medium truncate">
            Currently viewing: {getActiveSectionName()}
          </span>
        </div>
      )}

      {/* Content Area - with custom scrollbar styles */}
      <div className="flex-grow overflow-y-auto px-2 py-4 mb-[100px] sidebar-content">
        {isInfoPage ? (
          // Index Section for info.jsx with Search
          <>
            <div className={`mb-3 transition-opacity ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
              <h3 className="text-[#909096] text-sm font-medium mb-2 px-2 flex items-center">
                <FiList className="text-[#FFB255] mr-2" />
                <span>Form Index</span>
              </h3>
              
              {/* Search Input for Index */}
              {!isCollapsed && (
                <div className="relative px-2 mb-3">
                  <input 
                    type="text" 
                    placeholder="Search sections..." 
                    value={indexSearchQuery} 
                    onChange={(e) => setIndexSearchQuery(e.target.value)}
                    className="w-full bg-[#3a3b40] text-[#f5f5f5] text-xs rounded-lg pl-8 pr-3 py-1.5 placeholder-[#909096] focus:outline-none focus:ring-1 focus:ring-[#FFB255] transition-all"
                  />
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#909096] text-xs" />
                </div>
              )}
            </div>
            
            <div className="space-y-0.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1" 
                 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {filteredFormSections.length > 0 ? (
                filteredFormSections.map((section) => {
                  // Use the stable active section for highlighting
                  const isActive = stableActiveSection === section.id;
                  
                  return (
                    <div 
                      key={section.id}
                      onClick={() => scrollToSection(section.id)} 
                      className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${isCollapsed ? "justify-center" : ""}
                      ${isActive 
                        ? "bg-[#FFB255] bg-opacity-20 border-l-2 border-[#FFB255]" 
                        : "hover:bg-[#3a3b40]"}`}
                      title={isCollapsed ? section.title : ""}
                    >
                      {isCollapsed ? (
                        <div 
                          className={`w-5 h-5 rounded-full ${
                            isActive 
                              ? "bg-[#FFB255] text-white" 
                              : "bg-[#FFB255] bg-opacity-20 text-[#FFB255]"
                          } flex items-center justify-center text-xs font-medium`}
                        >
                          {section.number}
                        </div>
                      ) : (
                        <>
                          <div 
                            className={`w-4 h-4 rounded-full ${
                              isActive 
                                ? "bg-[#FFB255] text-white" 
                                : "bg-[#FFB255] bg-opacity-20 text-[#FFB255]"
                            } flex items-center justify-center text-xs font-medium flex-shrink-0`}
                          >
                            {section.number}
                          </div>
                          <span 
                            className={`text-xs transition-colors truncate ${
                              isActive 
                                ? "text-[#FFB255] font-medium" 
                                : "text-[#f5f5f5]"
                            }`}
                          >
                            {section.title}
                          </span>
                        </>
                      )}
                      {isCollapsed && (
                        <span className="absolute left-full ml-2 px-2 py-1 bg-[#3a3b40] text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {section.title}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className={`text-[#909096] text-xs px-2 transition-opacity ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
                  No matching sections found
                </p>
              )}
            </div>
          </>
        ) : (
          // Files Section for Dashboard with Search
          <>
            <div className={`mb-3 transition-opacity ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
              <h3 className="text-[#909096] text-sm font-medium mb-2 px-2">
                Course Handouts
              </h3>
              
              {/* Search Input for Files */}
              {!isCollapsed && (
                <div className="relative px-2">
                  <input 
                    type="text" 
                    placeholder="Search handouts..." 
                    value={fileSearchQuery} 
                    onChange={(e) => setFileSearchQuery(e.target.value)} 
                    className="w-full bg-[#3a3b40] text-[#f5f5f5] text-xs rounded-lg pl-8 pr-3 py-1.5 placeholder-[#909096] focus:outline-none focus:ring-1 focus:ring-[#FFB255] transition-all"
                  />
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#909096] text-xs" />
                </div>
              )}
            </div>
            
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto pr-1" 
                 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {filteredFiles && filteredFiles.length > 0 ? (
                filteredFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="group flex items-center justify-between py-1.5 px-2 mb-1 rounded-md hover:bg-[#3a3b40] transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onFileSelect(index);
                    }}
                    title={file.course_name || file.filename}
                  >
                    {isCollapsed ? (
                      <div className="flex-grow flex justify-center">
                        <AiOutlineFilePdf className="text-[#FFB255] text-lg" />
                      </div>
                    ) : (
                      <span className="text-[#f5f5f5] text-xs truncate max-w-[70%]">
                        {file.course_name || file.filename}
                      </span>
                    )}
                    {!isCollapsed && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileDownload(index);
                          }}
                          className="p-1 hover:bg-[#4a4b50] rounded-md transition-colors"
                          title="Download"
                        >
                          <IoMdDownload className="w-3.5 h-3.5 text-[#909096] hover:text-[#FFB255]" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileDelete(index);
                          }}
                          className="p-1 hover:bg-[#4a4b50] rounded-md transition-colors"
                          title="Delete"
                        >
                          <AiFillDelete className="w-3.5 h-3.5 text-[#909096] hover:text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className={`text-[#909096] text-xs px-2 transition-opacity ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
                  {fileSearchQuery ? "No matching handouts found" : "No handouts uploaded"}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#25262a] py-3 border-t border-[#3a3b40]">
        <form onSubmit={handleLogout} className="w-full">
          <button 
            type="submit"
            className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-all hover:bg-[#3a3b40] group relative ${isCollapsed ? "justify-center" : ""}`}
            title="Logout"
          >
            <TfiPowerOff className="text-[#909096] group-hover:text-[#FFB255] text-lg" />
            <div className={`flex flex-col items-start transition-opacity duration-300 ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}`}>
              <span className="text-[#f5f5f5] text-sm">Logout</span>
            </div>
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-[#3a3b40] text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Logout
              </span>
            )}
          </button>
        </form>
        
        <button 
          className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-all hover:bg-[#3a3b40] group relative ${isCollapsed ? "justify-center" : ""}`}
          title="Support"
        >
          <RxQuestionMarkCircled className="text-[#909096] group-hover:text-[#FFB255] text-lg" />
          <span className={`text-[#f5f5f5] text-sm transition-opacity duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
            Support
          </span>
          {isCollapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 bg-[#3a3b40] text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
              Support
            </span>
          )}
        </button>
      </div>
      
      {/* Add global styles to hide scrollbar */}
      <style jsx global>{`
        .sidebar-content::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        
        .sidebar-content {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .sidebar-content > div::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        
        .sidebar-content > div {
          scrollbar-width: none;
          -ms-overflow-style: none;
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