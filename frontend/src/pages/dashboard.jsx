import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import constants from "../constants";
import Box from "../components/Box";
import AsideComp from "../components/AsideComp";
import LoadingSpinner from "@/components/ui/LoadingSpinner";


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
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 transform hover:shadow-lg transition-all duration-300">
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                Welcome, {userData?.displayName || "User"}
              </h1>
              <p className="text-gray-600 text-base">
                Generate your coursefile....
              </p>
            </div>

            {/* Instructions Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 transform hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-medium shadow-sm">
                  i
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Instructions
                </h2>
              </div>

              <div className="space-y-6">
                {[
                  {
                    title: "Upload Handout",
                    description: 'Click the "Upload Handout" button to upload your course\'s handout in PDF format. A card for the subject will be created automatically.',
                  },
                  {
                    title: "View or Edit Information",
                    description: 'After uploading, click the "View" button on the card to add or view detailed information related to the course.',
                  },
                  {
                    title: "Delete Card",
                    description: 'If you wish to remove the course handout, click the "Delete" icon on the card to delete it permanently.',
                  },
                  {
                    title: "Download Handout",
                    description: 'To download the uploaded handout, simply click the "Download" arrow icon.',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-[#FFB255] font-medium shadow-sm group-hover:shadow-md transition-all duration-300">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 text-base mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.description.split(/"([^"]*)"/).map((part, i) =>
                          i % 2 === 1 ? (
                            <span key={i} className="font-medium text-[#FFB255]">"{part}"</span>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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