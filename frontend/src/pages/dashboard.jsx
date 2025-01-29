import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import constants from "../constants";
import Box from "../components/Box";
import AsideComp from "../components/AsideComp";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import WelcomeCard from "../components/WelcomeCard";
import FeedbackForm from '../components/FeedbackForm';
import { IoReturnUpBackSharp } from "react-icons/io5";
import { AlertCircle } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [file, setFileData] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [selectedFileData, setSelectedFileData] = useState(null);
  const [formValidation, setFormValidation] = useState({
    isValid: true,
    message: ""
  });
  const feedbackFormRef = useRef();

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

  useEffect(() => {
    const fetchFileDetails = async () => {
      if (selectedFileIndex !== null) {
        const token = localStorage.getItem("token");
        try {
          const response = await axios.post(
            constants.url + '/numdata', 
            { num: selectedFileIndex },
            { headers: { 'x-auth-token': token }}
          );
          setSelectedFileData(response.data);
        } catch (error) {
          console.error("Error fetching file details:", error);
        }
      }
    };

    if (selectedFileIndex !== null) {
      fetchFileDetails();
    }
  }, [selectedFileIndex]);

  const handleBackToFiles = () => {
    setSelectedFileIndex(null);
    setSelectedFileData(null);
  };
  const handleSubmit = async () => {
    try {
      if (!feedbackFormRef.current) return;
      
      // Get validation result
      const { isValid, message } = feedbackFormRef.current.validateForm();
      
      if (!isValid) {
        setFormValidation({ isValid, message });
        return;
      }
  
      // Clear any previous error
      setFormValidation({ isValid: true, message: "" });
      
      // Proceed with submission
      setIsLoading(true);
      await feedbackFormRef.current.submitForm();
      window.location.reload();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting form. Please check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !userData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#FFFEFD]">
      <div className="flex h-full">
        <AsideComp
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          files={file}
        />

        <div className="flex-1 p-6 overflow-auto">
          {selectedFileIndex === null ? (
            <div className="max-w-6xl mx-auto space-y-6">
              <WelcomeCard userName={userData["name"]} />
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 transform hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-medium shadow-sm">
                    F
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Your Files
                  </h2>
                </div>
                <Box 
                  files={file} 
                  onFileSelect={(index) => setSelectedFileIndex(index)}
                />
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto w-full">
               <div className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center sticky top-0 z-10 mb-6">
                <button
                  onClick={handleBackToFiles}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  <IoReturnUpBackSharp className="text-xl" />
                  <span className="font-medium">Back to Files</span>
                </button>

                <div className="flex items-center gap-4">
                  {/* In Dashboard's render */}
{!formValidation.isValid && (
  <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
    <AlertCircle className="w-5 h-5 text-red-600" />
    <span className="text-red-600 text-sm">
      {formValidation.message}
    </span>
  </div>
)}
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`px-8 py-3 font-semibold rounded-lg shadow-sm transition-all ${
                      isLoading
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#FFB255] hover:bg-[#FFA042] text-white"
                    }`}
                  >
                    {isLoading ? <LoadingSpinner size="small" /> : "Submit Form"}
                  </button>
                </div>
              </div>
              {selectedFileData && selectedFileData.done === 1 ? (
                <FeedbackForm
                  ref={feedbackFormRef}
                  onValidationChange={setFormValidation}
                  file={selectedFileData.filename}
                  num={selectedFileIndex}
                  courseDescription={selectedFileData["course_description"] || ""}
                  coursecode={selectedFileData['course_code'] || ""}
                  coursetitle={selectedFileData['course_name'] || ""}
                  module={selectedFileData['Module/Semester'] || ""}
                  session={selectedFileData['Session'] || ""}
                  courseSyllabus={selectedFileData["Course Syllabus"] || ""}
                  learningResources={selectedFileData["Learning Resources"] || ""}
                  copoMappingData={selectedFileData["copoMappingData"] || ""}
                  internalAssessmentData={selectedFileData["internalAssessmentData"]}
                  actionsForWeakStudentsData={selectedFileData["actionsForWeakStudentsData"] || ""}
                  program={selectedFileData["Program"] || ""}
                  weeklyTimetableData={selectedFileData["weeklyTimetableData"] || ""}
                  studentListData={selectedFileData["studentListData"] || []}
                  weakStudentsData={selectedFileData["weakStudentsData"] || []}
                  marksDetailsData={selectedFileData["marksDetailsData"] || []}
                  attendanceReportData={selectedFileData["attendanceReportData"] || []}
                  aqis={selectedFileData["mergePDF"] || {}}
                  coWeightages={selectedFileData["coWeightages"] || {}}
                  coAttainmentCriteria={selectedFileData["coAttainmentCriteria"] || {}}
                />
              ) : (
                <LoadingSpinner />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;