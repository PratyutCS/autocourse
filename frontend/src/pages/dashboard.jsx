import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import constants from "../constants";
import Box from "../components/Box";
import AsideComp from "../components/AsideComp";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import WelcomeCard from "../components/WelcomeCard";
import FeedbackForm from "../components/FeedbackForm";
import { IoSearch, IoFilter, IoClose, IoCheckmark, IoArrowBack } from "react-icons/io5";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [files, setFiles] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // New state variables for document viewing
  const [isViewingDocument, setIsViewingDocument] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);

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

  // Function to view a document
  const viewDocument = async (num) => {
    setDocumentLoading(true);
    setIsViewingDocument(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(constants.url + '/numdata', { num }, {
        headers: { 
          'x-auth-token': token,
          'ngrok-skip-browser-warning': '69420'
        }
      });
      
      setCurrentDocument({
        data: response.data,
        num: num
      });
    } catch (error) {
      console.error("Error fetching document data:", error);
    } finally {
      setDocumentLoading(false);
    }
  };

  // Function to go back to files view
  const goBackToFiles = () => {
    setIsViewingDocument(false);
    setCurrentDocument(null);
  };

  // Filter files based on search term and filter status
  const getFilteredFiles = () => {
    if (!files || !Array.isArray(files) || files.length === 0) return [];
    
    let filtered = [...files];
    
    // Apply search filter if there's a search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(file => {
        const name = file.course_name || file.course_code || file.filename || "Unknown Course";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    // Apply status filter
    if (selectedFilter === 'completed') {
      return filtered.filter(file => file.done === 1);
    } else if (selectedFilter === 'incomplete') {
      return filtered.filter(file => file.done !== 1);
    }
    
    return filtered;
  };
  
  const filteredFiles = getFilteredFiles();

  // Get count of total documents that match filter
  const getFilterCount = () => {
    if (!files || !Array.isArray(files)) return 0;
    
    if (selectedFilter === 'completed') {
      return files.filter(file => file.done === 1).length;
    } else if (selectedFilter === 'incomplete') {
      return files.filter(file => file.done !== 1).length;
    }
    return files.length;
  };

  if (isLoading || !userData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#FFFEFD]">
      <div className="flex h-full">
        <AsideComp 
          userEmail={userData.email}
          files={files} 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />

        <div className="flex-1 p-6 overflow-auto">
          {!isViewingDocument ? (
            // Regular files dashboard view
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Welcome Section */}
              <WelcomeCard userName={userData.name} />
              {/* File Cards Section */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 transform">
                {/* Files Header with Search */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-medium shadow-sm">
                      F
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Your Files
                      <span className="ml-2 text-sm font-medium text-gray-500">({getFilterCount()})</span>
                    </h2>
                  </div>
                  
                  {/* Search and filter controls */}
                  {files && Array.isArray(files) && files.length > 0 && (
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Search input */}
                      <div className="relative flex-grow sm:flex-grow-0">
                        <input
                          type="text"
                          placeholder="Search files..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full sm:w-64 pl-10 pr-9 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB255] focus:border-transparent transition-all shadow-sm text-sm"
                        />
                        <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <IoClose className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Filter dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setIsFilterOpen(!isFilterOpen)}
                          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          <IoFilter className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700 hidden sm:inline">Filter</span>
                        </button>
                        
                        {isFilterOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                            <button
                              onClick={() => {
                                setSelectedFilter('all');
                                setIsFilterOpen(false);
                              }}
                              className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                            >
                              <span>All Documents</span>
                              {selectedFilter === 'all' && <IoCheckmark className="w-4 h-4 text-[#FFB255]" />}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFilter('completed');
                                setIsFilterOpen(false);
                              }}
                              className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                            >
                              <span>Completed</span>
                              {selectedFilter === 'completed' && <IoCheckmark className="w-4 h-4 text-[#FFB255]" />}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFilter('incomplete');
                                setIsFilterOpen(false);
                              }}
                              className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                            >
                              <span>Incomplete</span>
                              {selectedFilter === 'incomplete' && <IoCheckmark className="w-4 h-4 text-[#FFB255]" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Active filters display */}
                {(selectedFilter !== 'all' || searchTerm) && (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    
                    {selectedFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFB255]/10 text-[#FFB255] rounded-full text-xs font-medium">
                        {selectedFilter === 'completed' ? 'Completed' : 'Incomplete'}
                        <button
                          onClick={() => setSelectedFilter('all')}
                          className="hover:text-orange-600"
                        >
                          <IoClose className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )}
                    
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        Search: {searchTerm}
                        <button
                          onClick={() => setSearchTerm('')}
                          className="hover:text-gray-900"
                        >
                          <IoClose className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
                
                {/* Box component with files and viewDocument function */}
                <Box 
                  files={filteredFiles} 
                  userData={userData} 
                  viewDocument={viewDocument}
                />
              </div>
            </div>
          ) : (
            // Document view
            <div className="max-w-6xl mx-auto">
              {/* Back button */}
              <button 
                onClick={goBackToFiles}
                className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <IoArrowBack className="w-5 h-5" />
                <span>Back to files</span>
              </button>
              
              {documentLoading ? (
                <LoadingSpinner />
              ) : (
                currentDocument && currentDocument.data.done === 1 ? (
                  <FeedbackForm
                    file={currentDocument.data.filename}
                    num={currentDocument.num}
                    courseDescription={currentDocument.data["course_description"] || ""}
                    coursecode={currentDocument.data['course_code'] || ""}
                    coursetitle={currentDocument.data['course_name'] || ""}
                    module={currentDocument.data['Module/Semester'] || ""}
                    session={currentDocument.data['Session'] || ""}
                    courseSyllabus={currentDocument.data["Course Syllabus"] || ""}
                    learningResources={currentDocument.data["Learning Resources"] || ""}
                    copoMappingData={currentDocument.data["copoMappingData"] || ""}
                    internalAssessmentData={currentDocument.data["internalAssessmentData"]}
                    actionsForWeakStudentsData={currentDocument.data["actionsForWeakStudentsData"] || ""}
                    program={currentDocument.data["Program"] || ""}
                    weeklyTimetableData={currentDocument.data["weeklyTimetableData"] || ""}
                    mergePDF={currentDocument.data["mergePDF"] || ""}
                    coWeightages={currentDocument.data["coWeightages"] || {}}
                    coAttainmentCriteria={currentDocument.data["coAttainmentCriteria"] || {}}
                    studentData={currentDocument.data["studentData"] || {}}
                    targetAttainment={currentDocument.data["targetAttainment"] || {}}
                    feedbackData={currentDocument.data["feedbackData"] || {}}
                    facultyCourseReview={currentDocument.data["facultyCourseReview"] || ""}
                    learnerCategories={currentDocument.data["learnerCategories"] || {}}
                    selectedAssessments={currentDocument.data["selectedAssessments"] || []}
                    par_sem_slowLearner={currentDocument.data["par_sem_slowLearner"] || []}
                  />
                ) : (
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <p>This document is still being processed. Please wait...</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;