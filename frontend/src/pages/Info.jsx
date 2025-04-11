import React, { useEffect, useState, useRef } from 'react';
import constants from "../constants";
import axios from 'axios';
import FeedbackForm from '../components/FeedbackForm';
import { useLocation } from 'react-router-dom';
import AsideComp from '../components/AsideComp';
import '../css/dash.css';
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const ErrorDisplay = ({ message }) => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="text-red-500 bg-red-50 px-6 py-4 rounded-lg shadow-sm">
      <p className="font-medium">{message}</p>
    </div>
  </div>
)

const Info = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { num, userData } = location.state || {};
  const token = localStorage.getItem('token');
  const [file, setFileData] = useState(null);
  const [error, setError] = useState(null);
  const [allFiles, setAllFiles] = useState(null);
  const [activeSection, setActiveSection] = useState("header-section"); // Default active section
  const observerRef = useRef(null);
  const sectionsRef = useRef([]);
  
  // Fetch all files for the sidebar
  useEffect(() => {
    const fetchAllFiles = async () => {
      try {
        const filesResponse = await axios.get(constants.url + "/files", {
          headers: {
            "x-auth-token": token,
            "ngrok-skip-browser-warning": "69420"
          },
        });
        setAllFiles(filesResponse.data);
      } catch (error) {
        console.error("Error fetching all files:", error);
      }
    };
    
    fetchAllFiles();
  }, [token]);
  
  // Fetch single file data
  useEffect(() => {
    let pollingInterval = null;
    
    const fetchFilesData = async () => {
      try {
        const response = await axios.post(
          constants.url + '/numdata',
          { num },
          {
            headers: {
              'x-auth-token': token,
              'ngrok-skip-browser-warning': '69420'
            }
          }
        );
        setFileData(response.data);
        if (response.data.done === 1) {
          clearInterval(pollingInterval);
        }
      } catch (error) {
        console.error("Error fetching files data:", error);
        setError('Failed to load data');
        clearInterval(pollingInterval);
      }
    };
    
    if (num !== undefined) {
      pollingInterval = setInterval(fetchFilesData, 1000);
      fetchFilesData();
    }
    
    return () => clearInterval(pollingInterval);
  }, [num, token]);

  // Setup intersection observer for tracking the visible sections
  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Wait for content to load before setting up observer
    if (!file || file.done !== 1) return;
    
    // Wait a bit for the DOM to be fully ready
    const setupObserver = setTimeout(() => {
      // Add section IDs to sections if they don't have them
      const sections = document.querySelectorAll('[id$="-section"]');
      sectionsRef.current = Array.from(sections);
      
      console.log(`Found ${sections.length} sections in the document`);
      
      if (sections.length === 0) {
        console.warn("No sections found with -section suffix");
        return;
      }
      
      // Create a new intersection observer
      const observer = new IntersectionObserver(
        (entries) => {
          // Filter for entries that are currently intersecting
          const visibleEntries = entries.filter(entry => entry.isIntersecting);
          
          if (visibleEntries.length > 0) {
            // Sort by y position to prioritize the one at the top
            visibleEntries.sort((a, b) => {
              const aRect = a.boundingClientRect;
              const bRect = b.boundingClientRect;
              return aRect.top - bRect.top;
            });
            
            const topSection = visibleEntries[0];
            if (topSection && topSection.target.id) {
              const newActiveSection = topSection.target.id;
              console.log(`Setting active section to: ${newActiveSection}`);
              setActiveSection(newActiveSection);
            }
          }
        },
        {
          root: document.querySelector('.space-y-6.overflow-scroll'), // Scroll container
          rootMargin: '-100px 0px -70% 0px', // Consider elements in the top portion of the viewport
          threshold: 0.05 // Detect when just a small part is visible
        }
      );
      
      // Observe all sections
      sections.forEach(section => {
        observer.observe(section);
      });
      
      // Store the observer for cleanup
      observerRef.current = observer;
      
    }, 1000);
    
    return () => {
      clearTimeout(setupObserver);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [file]);

  // Function to manually check which section is visible when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.space-y-6.overflow-scroll');
      if (!container || sectionsRef.current.length === 0) return;
      
      // Get container dimensions
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;
      const viewableAreaTop = containerTop + 100; // Add some offset
      
      // Find the topmost visible section
      let activeElement = null;
      let smallestDistance = Infinity;
      
      sectionsRef.current.forEach(section => {
        const rect = section.getBoundingClientRect();
        
        // If the top of the section is above the viewable area's top
        // and it's the closest to the top of the viewable area
        if (rect.top <= viewableAreaTop && (viewableAreaTop - rect.top) < smallestDistance) {
          smallestDistance = viewableAreaTop - rect.top;
          activeElement = section;
        }
      });
      
      if (activeElement && activeElement.id) {
        setActiveSection(activeElement.id);
      }
    };
    
    const container = document.querySelector('.space-y-6.overflow-scroll');
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [file]);

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  // Function to scroll to a specific section
  const handleSectionSelect = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const container = document.querySelector('.space-y-6.overflow-scroll');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        const offsetTop = section.offsetTop;
        
        container.scrollTo({
          top: offsetTop - 80, // Add offset for padding/margin
          behavior: 'smooth'
        });
      } else {
        section.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start' 
        });
      }
      
      // Force update active section
      setActiveSection(sectionId);
    } else {
      console.warn(`Section with id ${sectionId} not found`);
    }
  };

  return (
    <div className='dash'>
      <AsideComp
        userEmail={userData?.email}
        files={allFiles}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onFileSelect={handleSectionSelect}
        activeSection={activeSection}
      />
      <div className="right h-screen overflow-hidden">
        <div className="box23 w-full h-full">
          {file && file.done === 1 ? (
            <FeedbackForm
              file={file.filename}
              num={num}
              courseDescription={file["course_description"] || ""}
              coursecode={file['course_code'] || ""}
              coursetitle={file['course_name'] || ""}
              module={file['Module/Semester'] || ""}
              session={file['Session'] || ""}
              courseSyllabus={file["Course Syllabus"] || ""}
              learningResources={file["Learning Resources"] || ""}
              copoMappingData={file["copoMappingData"] || ""}
              internalAssessmentData={file["internalAssessmentData"]}
              actionsForWeakStudentsData={file["actionsForWeakStudentsData"] || ""}
              program={file["Program"] || ""}
              weeklyTimetableData={file["weeklyTimetableData"] || ""}
              coWeightages={file["coWeightages"] || {}}
              coAttainmentCriteria={file["coAttainmentCriteria"] || {}}
              studentData={file["studentData"] || {}}
              targetAttainment={file["targetAttainment"] || {}}
              feedbackData={file["feedbackData"] || {}}
              facultyCourseReview={file["facultyCourseReview"] || ""}
              learnerCategories={file["learnerCategories"] || [[],[]]}
              selectedAssessments={file["selectedAssessments"] || []}
              par_sem_slowLearner={file["par_sem_slowLearner"] || [[],[]]}
            />
          ) : (
            <LoadingSpinner />
          )}
        </div>
      </div>
      
      {/* Add debugging overlay for active section */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 right-0 bg-black bg-opacity-70 text-white p-2 text-xs z-50">
          Active: {activeSection}
        </div>
      )}
    </div>
  );
};

export default Info;