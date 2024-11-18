import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import constants from "../constants";
// import "../css/dash.css";
import Box from "../components/Box";
import AsideComp from "../components/AsideComp";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [file, setFileData] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);


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
              console.error("Error recieving data:", error);
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
        }
      }
    };

    fetchFilesData();
  }, [userData]);

  // console.log(file);

  

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFB255] border-t-transparent"></div>
      </div>
    );
  }
  return (
    <div className="h-screen w-full overflow-hidden bg-[#FFFEFD]">
    <div className="flex h-full ">
      <AsideComp isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        <div className="flex-1 p-8 overflow-scroll">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome, {userData?.displayName || "User"}
              </h1>
              <p className="text-gray-600">
                Manage your course handouts and materials efficiently
              </p>
            </div>

            {/* Instructions Card */}
            <div className="bg-white rounded-xl shadow-md p-6  border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
                  i
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Instructions
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-[#FFB255] font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Upload Handout</h3>
                    <p className="text-gray-600">
                      Click the <span className="font-medium text-[#FFB255]">"Upload Handout"</span> button 
                      to upload your course's handout in PDF format. A card for the subject will be created automatically.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-[#FFB255] font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">View or Edit Information</h3>
                    <p className="text-gray-600">
                      After uploading, click the <span className="font-medium text-[#FFB255]">"View"</span> button 
                      on the card to add or view detailed information related to the course.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-[#FFB255] font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Delete Card</h3>
                    <p className="text-gray-600">
                      If you wish to remove the course handout, click the <span className="font-medium text-[#FFB255]">"Delete"</span> 
                      icon on the card to delete it permanently.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-[#FFB255] font-semibold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Download Handout</h3>
                    <p className="text-gray-600">
                      To download the uploaded handout, simply click the <span className="font-medium text-[#FFB255]">"Download"</span> 
                      arrow icon.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* File Cards Section */}
            <div className="bg-white rounded-xl shadow-md p-6 ">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
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