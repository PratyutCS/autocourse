import { useEffect, useState } from "react";
import { TfiPowerOff } from "react-icons/tfi";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { HiMenuAlt3 } from "react-icons/hi";
import constants from "../constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const AsideComp = ({ isCollapsed, setIsCollapsed }) => {
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
        {
          headers: { "x-auth-token": token },
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

  if (isLoading) {
    return (
      <aside className="w-[20vw] h-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
      </aside>
    );
  }

  return (
    <aside
      className={`relative flex flex-col bg-gradient-to-b from-gray-800 to-gray-900 h-full transition-all duration-300 ease-in-out shadow-xl ${
        isCollapsed ? "w-[4vw]" : "w-[20vw]"
      }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-[-12px] top-6 bg-gray-700 rounded-full p-1.5 hover:bg-gray-600 transition-colors z-10 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
      >
        <HiMenuAlt3
          size={20}
          className={`text-gray-100 transform transition-transform duration-300 ${
            isCollapsed ? "rotate-180" : ""
          }`}
        />
      </button>

      <div className="flex items-center h-[20%] gap-6 px-6 border-b border-gray-700/50">
        <img
          src="/customer-logo.png"
          alt="BMU Logo"
          className="h-[7vh] w-auto drop-shadow-lg"
        />
        <h1
          className={`font-['Nunito'] font-medium text-gray-100 text-[2vmin] transition-opacity duration-300 ${
            isCollapsed ? "opacity-0" : "opacity-100"
          }`}
        >
          Bml Munjal University
        </h1>
      </div>

      <div className="absolute bottom-4 left-0 w-full px-4 text-gray-300 font-['Lato'] flex flex-col justify-evenly items-start gap-4">
        <button
          type="button"
          className="flex items-center gap-4 text-[2vmin] w-full p-2 rounded-lg hover:bg-gray-700/50 hover:text-blue-400 transition-all duration-200 group"
        >
          <RxQuestionMarkCircled size={24} className="group-hover:scale-110 transition-transform duration-200" />
          <span
            className={`transition-opacity duration-300 ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            Support
          </span>
        </button>

        <form onSubmit={handleLogout} className="w-full">
          <button
            type="submit"
            className="flex items-center gap-4 text-[2vmin] w-full p-2 rounded-lg hover:bg-gray-700/50 hover:text-red-400 transition-all duration-200 group"
          >
            <TfiPowerOff size={24} className="group-hover:scale-110 transition-transform duration-200" />
            <div
              className={`flex flex-col items-start transition-opacity duration-300 ${
                isCollapsed ? "opacity-0" : "opacity-100"
              }`}
            >
              <span>Logout</span>
              {userData && (
                <p className="text-[1.75vmin] text-gray-400 font-light">{userData.email}</p>
              )}
            </div>
          </button>
        </form>
      </div>
    </aside>
  );
};

AsideComp.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  setIsCollapsed: PropTypes.func.isRequired,
};

export default AsideComp;