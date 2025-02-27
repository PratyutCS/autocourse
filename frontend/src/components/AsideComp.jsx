import { useEffect, useState } from "react";
import { TfiPowerOff } from "react-icons/tfi";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { HiMenuAlt3 } from "react-icons/hi";
import constants from "../constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const AsideComp = ({ userEmail, isCollapsed, setIsCollapsed }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (userEmail) {
      setIsLoading(false);
    }
  }, [navigate]);

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

  if (isLoading) {
    return (
      <aside className="w-[20vw] h-full bg-[#323439] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300"></div>
      </aside>
    );
  }

  return (
    <aside
      className={`relative flex flex-col bg-[#323439] h-full transition-all duration-300 ease-in-out ${isCollapsed ? "w-[4vw]" : "w-[20vw]"
        }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-[-12px] top-6 bg-[#323439] rounded-full p-1 hover:bg-[#3a3c42] transition-colors z-10"
      >
        <HiMenuAlt3
          size={20}
          className={`text-gray-300 transform transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""
            }`}
        />
      </button>

      <div className="flex items-center  h-[20%] gap-4">
        <img
          src="/customer-logo.png"
          alt="BMU Logo"
          className="h-[7vh] w-auto"
        />
        <h1
          className={`font-['Nunito'] font-light text-[#c3c3c3] text-[2vmin] transition-opacity duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"
            }`}
        >
          Bml Munjal University
        </h1>
      </div>

      <div className="absolute bottom-4 left-3 w-[90%] text-[#c3c3c3] font-['Lato'] font-thin flex flex-col justify-evenly items-start gap-4">
        <button
          type="button"
          className="flex items-center gap-4 text-[2vmin] hover:text-white transition-colors"
        >
          <RxQuestionMarkCircled size={24} className="hover:text-white" />
          <span
            className={`transition-opacity  font-light text-m duration-300 hover:text-white ${isCollapsed ? "opacity-0" : "opacity-100"
              }`}
          >
            Support
          </span>
        </button>

        <form onSubmit={handleLogout} className="w-full">
          <button
            type="submit"
            className="flex items-center gap-4 text-[2vmin] hover:text-white transition-colors"
          >
            <TfiPowerOff size={24} className="hover:text-white" />
            <div
              className={`flex flex-col items-start transition-opacity duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"
                }`}
            >
              <span className="text-m font-light hover:text-white">Logout</span>
              {userEmail && (
                <p className="font-light text-[#E4F3FF] opacity-[0.3] hover:text-white">{userEmail}</p>
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