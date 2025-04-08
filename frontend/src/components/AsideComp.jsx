import { useEffect, useState } from "react";
import { TfiPowerOff } from "react-icons/tfi";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { HiMenuAlt3 } from "react-icons/hi";
import { AiFillDelete } from "react-icons/ai";
import { IoMdDownload } from "react-icons/io";
import { AiOutlineFilePdf } from "react-icons/ai";
import { FiList } from "react-icons/fi"; // Added for index icon
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import constants from "../constants"; 

const AsideComp = ({ isCollapsed, setIsCollapsed, files, onFileSelect, activeSection }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Explicitly check if we're on the info page
  const isInfoPage = location.pathname.includes('/form');
  
  console.log("Current path:", location.pathname);
  console.log("Is info page:", isInfoPage);
  console.log("Active section:", activeSection);

  // Define the index sections for the form
  const formSections = [
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

  // Function to scroll to a section when clicked in the index
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Get the container element that should be scrolled
      const container = document.querySelector('.space-y-6.overflow-auto');
      if (container) {
        // Calculate position accounting for any container offsets
        const topPosition = element.offsetTop - container.offsetTop;
        
        // Scroll the container instead of the whole page
        container.scrollTo({
          top: topPosition - 20, // Add some padding
          behavior: 'smooth'
        });
      } else {
        // Fallback to the original method if container not found
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
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

  return (
    <aside
      className={`relative flex flex-col h-full transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-[4.5vw]" : "w-[20vw]"} 
        bg-gradient-to-b from-[#2d2e33] to-[#25262a] shadow-2xl`}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-[#3a3b40] rounded-full p-2 hover:bg-[#FFB255] 
          transition-all duration-300 shadow-lg hover:shadow-[#FFB255]/20 z-10"
      >
        <HiMenuAlt3
          size={20}
          className={`text-gray-300 transform transition-transform ${
            isCollapsed ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Logo Section */}
      <div className="flex-shrink-0 flex items-center h-[18%] px-4 py-6 border-b border-[#3a3b40]">
        <div className="flex items-center gap-3 w-full">
          <img
            src="/customer-logo.png"
            alt="BMU Logo"
            className="h-[6vh] w-auto transition-all duration-300"
          />
          <h1
            className={`font-['Nunito'] font-semibold text-[#f5f5f5] text-[1.8vmin] 
              transition-opacity duration-300 truncate ${
                isCollapsed ? "opacity-0 w-0" : "opacity-100 w-full"
              }`}
          >
            BML Munjal University
          </h1>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="flex-shrink-0 px-4 py-6 border-b border-[#3a3b40]">
        <div className="flex items-center gap-3 group">
          <div className="flex items-center justify-center h-10 w-10 rounded-full 
            bg-[#FFB255] text-white font-semibold text-sm shrink-0">
            {getUserInitials(userData?.name)}
          </div>
          <div
            className={`flex flex-col transition-opacity duration-300 overflow-hidden ${
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-full"
            }`}
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

      {/* Content Area - Conditionally show either Files or Index */}
      <div className="flex-grow overflow-y-auto px-2 py-4 mb-[120px]">
        {isInfoPage ? (
          // Index Section for info.jsx
          <>
            <h3 className={`text-[#909096] text-sm font-medium mb-3 px-2 transition-opacity flex items-center ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}>
              <FiList className="text-[#FFB255] mr-2" />
              <span>Form Index</span>
            </h3>
            
            <div className="space-y-1">
              {formSections.map((section) => {
                // Check if this section is the active one
                const isActive = activeSection === section.id;
                
                return (
                  <div 
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors group
                      ${isCollapsed ? "justify-center" : ""}
                      ${isActive 
                        ? "bg-[#FFB255] bg-opacity-20 border-l-4 border-[#FFB255]" 
                        : "hover:bg-[#3a3b40]"}`}
                    title={isCollapsed ? section.title : ""}
                  >
                    {isCollapsed ? (
                      <div className={`w-6 h-6 rounded-full ${isActive 
                        ? "bg-[#FFB255] text-white" 
                        : "bg-[#FFB255] bg-opacity-20 text-[#FFB255]"} 
                        flex items-center justify-center text-xs font-medium`}>
                        {section.number}
                      </div>
                    ) : (
                      <>
                        <div className={`w-5 h-5 rounded-full ${isActive 
                          ? "bg-[#FFB255] text-white" 
                          : "bg-[#FFB255] bg-opacity-20 text-[#FFB255]"}
                          flex items-center justify-center text-xs font-medium`}>
                          {section.number}
                        </div>
                        <span className={`text-sm transition-colors ${isActive 
                          ? "text-[#FFB255] font-medium" 
                          : "text-[#f5f5f5] group-hover:text-[#FFB255]"}`}>
                          {section.title}
                        </span>
                      </>
                    )}
                    {isCollapsed && (
                      <span className="absolute left-full ml-3 px-2 py-1 bg-[#3a3b40] text-white 
                        text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {section.title}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          // Files Section for Dashboard
          <>
            <h3 className={`text-[#909096] text-sm font-medium mb-3 px-2 transition-opacity ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}>
              Course Handouts
            </h3>
            
            {files && files.length > 0 ? (
              files.map((file, index) => (
                <div 
                  key={index} 
                  className="group flex items-center justify-between p-2 rounded-lg hover:bg-[#3a3b40] transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    onFileSelect(index); 
                  }}
                  title={file.course_name || file.filename}
                >
                  {/* Show either full name or PDF icon based on collapse state */}
                  {isCollapsed ? (
                    <div className="flex-grow flex justify-center">
                      <AiOutlineFilePdf className="text-[#FFB255] text-xl" />
                    </div>
                  ) : (
                    <span className="text-[#f5f5f5] text-sm truncate">
                      {file.course_name || file.filename}
                    </span>
                  )}
                  
                  {/* Action buttons - conditionally show based on collapse state */}
                  {!isCollapsed && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileDownload(index);
                        }}
                        className="p-1.5 hover:bg-[#4a4b50] rounded-md transition-colors"
                        title="Download"
                      >
                        <IoMdDownload className="w-4 h-4 text-[#909096] hover:text-[#FFB255]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileDelete(index);
                        }}
                        className="p-1.5 hover:bg-[#4a4b50] rounded-md transition-colors"
                        title="Delete"
                      >
                        <AiFillDelete className="w-4 h-4 text-[#909096] hover:text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className={`text-[#909096] text-sm px-2 transition-opacity ${
                isCollapsed ? "opacity-0" : "opacity-100"
              }`}>
                No handouts uploaded
              </p>
            )}
          </>
        )}
      </div>

      {/* Navigation Controls - Always visible with proper spacing */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#25262a] py-4 border-t border-[#3a3b40]">
        <form onSubmit={handleLogout} className="w-full">
          <button
            type="submit"
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all
              hover:bg-[#3a3b40] group relative ${
                isCollapsed ? "justify-center" : ""
              }`}
            title="Logout"
          >
            <TfiPowerOff className="text-[#909096] group-hover:text-[#FFB255] text-xl" />
            <div
              className={`flex flex-col items-start transition-opacity duration-300 ${
                isCollapsed ? "opacity-0 w-0" : "opacity-100"
              }`}
            >
              <span className="text-[#f5f5f5] text-sm">Logout</span>
            </div>
            {isCollapsed && (
              <span className="absolute left-full ml-3 px-2 py-1 bg-[#3a3b40] text-white 
                text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                Logout
              </span>
            )}
          </button>
        </form>
        <button
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all
            hover:bg-[#3a3b40] group relative ${
              isCollapsed ? "justify-center" : ""
            }`}
          title="Support"
        >
          <RxQuestionMarkCircled
            className="text-[#909096] group-hover:text-[#FFB255] text-xl"
          />
          <span
            className={`text-[#f5f5f5] text-sm transition-opacity duration-300 ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            Support
          </span>
          {isCollapsed && (
            <span className="absolute left-full ml-3 px-2 py-1 bg-[#3a3b40] text-white 
              text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              Support
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

AsideComp.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  setIsCollapsed: PropTypes.func.isRequired,
  files: PropTypes.array,
  onFileSelect: PropTypes.func,
  activeSection: PropTypes.string, // Add this prop for tracking active section
};

export default AsideComp;