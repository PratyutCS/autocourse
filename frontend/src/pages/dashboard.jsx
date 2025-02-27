import { useEffect, useState } from "react";
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
  const [files, setFiles] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validates token and fetch user details
  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const tokenResponse = await axios.post(
            constants.url + "/tokenIsValid",
            {},
            {
              headers: { 
                "x-auth-token": token,
                "ngrok-skip-browser-warning": "69420"
              },
            }
          );

          if (!tokenResponse.data) {
            localStorage.removeItem("token");
            navigate("/");
          } else {
            try {
              const userResponse = await axios.get(constants.url + "/", {
                headers: { 
                  "x-auth-token": token,
                  "ngrok-skip-browser-warning": "69420"
                },
              });
              setUserData(userResponse.data);
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

  // Fetch files data after userData is loaded
  useEffect(() => {
    const fetchFilesData = async () => {
      if (userData) {
        const token = localStorage.getItem("token");
        try {
          const filesResponse = await axios.get(constants.url + "/files", {
            headers: { 
              "x-auth-token": token,
              "ngrok-skip-browser-warning": "69420"
            },
          });
          setFiles(filesResponse.data);
        } catch (error) {
          console.error("Error fetching files data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchFilesData();
  }, [userData]);

  // Polling mechanism to check for file updates when any file's "done" value is not equal to 1
  useEffect(() => {
    let pollInterval;

    const pollForUpdates = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(constants.url + "/files", {
          headers: { 
            "x-auth-token": token,
            "ngrok-skip-browser-warning": "69420"
          },
        });
        // Compare the new files data with current state
        if (JSON.stringify(response.data) !== JSON.stringify(files)) {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error polling file updates:", error);
      }
    };

    if (files && Array.isArray(files)) {
      // Determine whether any file isn't marked as done (i.e., done !== 1)
      const needsPolling = files.some((file) => file.done !== 1);
      if (needsPolling) {
        // Poll every 10 seconds
        pollInterval = setInterval(pollForUpdates, 10000);
      }
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [files]);

  if (isLoading || !userData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#FFFEFD]">
      <div className="flex h-full">
        <AsideComp 
          userEmail={userData.email} 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />

        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Welcome Section */}
            <WelcomeCard userName={userData.name} />

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
              <Box files={files} userData={userData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;