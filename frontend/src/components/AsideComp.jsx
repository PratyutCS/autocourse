import { useEffect, useState } from "react";
import { TfiPowerOff } from "react-icons/tfi";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { HiMenuAlt3 } from "react-icons/hi";
import { AiFillDelete } from "react-icons/ai";
import { IoMdDownload } from "react-icons/io";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import constants from "../constants"; 

const AsideComp = ({ isCollapsed, setIsCollapsed,files }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

      {/* Files Section - Now with proper spacing for footer */}
      <div className="flex-grow overflow-y-auto px-2 py-4 mb-[120px]">
        <h3 className={`text-[#909096] text-sm font-medium mb-3 px-2 transition-opacity ${
          isCollapsed ? "opacity-0" : "opacity-100"
        }`}>
          Course Handouts
        </h3>
        
        {files && files.length > 0 ? (
          files.map((file, index) => (
            <div key={index} className="group flex items-center justify-between p-2 rounded-lg hover:bg-[#3a3b40] transition-colors">
              <span className={`text-[#f5f5f5] text-sm truncate transition-opacity ${
                isCollapsed ? "opacity-0" : "opacity-100"
              }`}>
                {file.course_name || file.filename}
              </span>
              
              <div className={`flex gap-2 ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
                <button
                  onClick={() => handleFileDownload(index)}
                  className="p-1.5 hover:bg-[#4a4b50] rounded-md transition-colors"
                  title="Download"
                >
                  <IoMdDownload className="w-4 h-4 text-[#909096] hover:text-[#FFB255]" />
                </button>
                <button
                  onClick={() => handleFileDelete(index)}
                  className="p-1.5 hover:bg-[#4a4b50] rounded-md transition-colors"
                  title="Delete"
                >
                  <AiFillDelete className="w-4 h-4 text-[#909096] hover:text-red-500" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={`text-[#909096] text-sm px-2 transition-opacity ${
            isCollapsed ? "opacity-0" : "opacity-100"
          }`}>
            No handouts uploaded
          </p>
        )}
      </div>

      {/* Navigation Controls - Now properly fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#25262a] py-6 border-t border-[#3a3b40]">
        <form onSubmit={handleLogout} className="w-full">
          <button
            type="submit"
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all
              hover:bg-[#3a3b40] group relative ${
                isCollapsed ? "justify-center" : ""
              }`}
          >
            <TfiPowerOff className="text-[#909096] group-hover:text-[#FFB255] text-xl" />
            <div
              className={`flex flex-col items-start transition-opacity duration-300 ${
                isCollapsed ? "opacity-0" : "opacity-100"
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
};

export default AsideComp;