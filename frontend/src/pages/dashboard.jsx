import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import constants from "../constants";
import Box from "../components/Box";
import AsideComp from "../components/AsideComp";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import WelcomeCard from "../components/WelcomeCard";


const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [file, setFileData] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const response = await axios.post(
            constants.url + "/tokenIsValid",
            {},
            {
              headers: { "x-auth-token": token },
            }
          );

          if (!response.data) {
            localStorage.removeItem("token");
            navigate("/");
          } else {
            try {
              const response = await axios.get(constants.url + "/", {
                headers: { "x-auth-token": token },
              });
              setUserData(response.data);
            } catch (error) {
              console.error("Error receiving data:", error);
              localStorage.removeItem("token");
              navigate("/");
            }
          }
        } catch (error) {
          console.error("Error validating token:", error);
          localStorage.removeItem("token");
          navigate("/");
        }
      } else {
        navigate("/");
      }
    };

    checkTokenValidity();
  }, [navigate]);

  useEffect(() => {
    console.log(userData);
    const fetchFilesData = async () => {
      if (userData) {
        const token = localStorage.getItem("token");
        try {
          const response = await axios.get(constants.url + "/files", {
            headers: { "x-auth-token": token },
          });
          setFileData(response.data);
        } catch (error) {
          console.error("Error fetching files data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchFilesData();
  }, [userData]);

  if (isLoading || !userData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#FFFEFD]">
      <div className="flex h-full">
        <AsideComp isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Welcome Section */}
            {/* Welcome Section */}
            <WelcomeCard userName={userData["name"]} />

            {/* File Cards Section */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 transform hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-medium shadow-sm">
                  F
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Your Files
                </h2>
              </div>
              
              <Box files={file} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;